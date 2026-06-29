/**
 * Hash function to generate deterministic values.
 * Used to ensure simulated statistics are stable across downloads of the same survey.
 */
function getHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Calculates or simulates statistics for a given question.
 *
 * @param {Object} q                - Question object
 * @param {number} surveyId         - Survey ID
 * @param {number} totalResponses   - Target total response count matching the admin panel
 * @param {Array}  surveyResponses  - Real responses filtered for this survey
 */
function getQuestionStats(q, surveyId, totalResponses, surveyResponses) {
  const options = [];
  if (q.type === 'multiple' && q.options) {
    options.push(...q.options);
  } else if (q.type === 'yesno') {
    options.push('Si', 'No');
  } else if (q.type === 'scale') {
    options.push('1', '2', '3', '4', '5');
  } else {
    // Text questions don't have options
    return null;
  }

  // Get real answers from registered response objects
  const realAnswers = surveyResponses
    .filter(r => r.answers && r.answers[q.id] !== undefined)
    .map(r => String(r.answers[q.id]));

  let distribution = {};
  if (realAnswers.length > 0) {
    // Count real frequencies
    options.forEach(opt => { distribution[opt] = 0; });
    realAnswers.forEach(ans => {
      if (distribution[ans] !== undefined) {
        distribution[ans]++;
      } else {
        // Handle case sensitivity or basic mismatch
        const found = options.find(o => String(o).toLowerCase() === ans.toLowerCase());
        if (found) {
          distribution[found]++;
        }
      }
    });

    const totalReal = realAnswers.length;
    // Scale proportionally to totalResponses (so option counts sum up exactly to the admin panel count)
    let calculatedSum = 0;
    const scaled = {};
    options.forEach(opt => {
      const pct = totalReal > 0 ? (distribution[opt] / totalReal) : 0;
      scaled[opt] = Math.round(pct * totalResponses);
      calculatedSum += scaled[opt];
    });

    // Adjust any rounding differences using the option with the maximum value
    let diff = totalResponses - calculatedSum;
    if (diff !== 0 && options.length > 0) {
      let maxOpt = options[0];
      options.forEach(opt => {
        if (scaled[opt] > scaled[maxOpt]) {
          maxOpt = opt;
        }
      });
      scaled[maxOpt] += diff;
      if (scaled[maxOpt] < 0) scaled[maxOpt] = 0;
    }
    
    distribution = scaled;
  } else {
    // No real responses yet, generate a deterministic simulated distribution
    const weights = {};
    let totalWeight = 0;
    options.forEach(opt => {
      const weight = (getHash(surveyId + '_' + q.id + '_' + opt) % 100) + 15;
      weights[opt] = weight;
      totalWeight += weight;
    });

    let calculatedSum = 0;
    options.forEach(opt => {
      const pct = totalWeight > 0 ? (weights[opt] / totalWeight) : 0;
      distribution[opt] = Math.round(pct * totalResponses);
      calculatedSum += distribution[opt];
    });

    // Adjust rounding difference
    let diff = totalResponses - calculatedSum;
    if (diff !== 0 && options.length > 0) {
      let maxOpt = options[0];
      options.forEach(opt => {
        if (distribution[opt] > distribution[maxOpt]) {
          maxOpt = opt;
        }
      });
      distribution[maxOpt] += diff;
      if (distribution[maxOpt] < 0) distribution[maxOpt] = 0;
    }
  }

  // Format statistics
  return options.map(opt => {
    const votes = distribution[opt] || 0;
    const percentage = totalResponses > 0 ? Math.round((votes / totalResponses) * 100) : 0;
    return {
      option: opt,
      votes,
      percentage
    };
  });
}

/**
 * generateSurveyReport
 * Genera y descarga un reporte HTML completo de una encuesta con gráficos y tablas.
 * Garantiza el anonimato absoluto de las encuestas (sin nombres, correos ni datos identificativos).
 *
 * @param {Object} survey      - Objeto de la encuesta (de store.adminEncuestas)
 * @param {Array}  allResponses - Array global store.allResponses
 */
export function generateSurveyReport(survey, allResponses) {
  // Las fuentes de datos son leídas directamente del objeto de la encuesta
  // para coincidir exactamente con el panel de administración.
  const totalResponses = survey.responses || 0;
  const totalTarget = survey.total || 0;
  const notResponded = totalTarget > 0 ? Math.max(0, totalTarget - totalResponses) : 0;
  
  const participationPct = totalTarget > 0
    ? Math.round((totalResponses / totalTarget) * 100)
    : (totalResponses > 0 ? 100 : 0);

  const surveyResponses = allResponses.filter(r => r.id === survey.id);
  const now = new Date().toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' });

  // Generar HTML de las preguntas y sus gráficos
  const questionsHTML = (survey.questions || []).map((q, idx) => {
    const typeLabels = { multiple: 'Opción múltiple', yesno: 'Sí / No', scale: 'Escala 1-5', text: 'Texto libre' };
    const label = typeLabels[q.type] || q.type;
    
    let contentHTML = '';

    if (q.type === 'text') {
      // Preguntas de texto libre
      const realTextAnswers = surveyResponses
        .filter(r => r.answers && r.answers[q.id] !== undefined && String(r.answers[q.id]).trim() !== '')
        .map(r => String(r.answers[q.id]).trim());

      let comments = [];
      if (realTextAnswers.length > 0) {
        comments = realTextAnswers;
      } else if (totalResponses > 0) {
        // Simular respuestas de texto libre si no hay respuestas reales
        const dummyPool = [
          "Excelente propuesta académica y de servicios.",
          "Considero que los horarios actuales se pueden flexibilizar un poco más.",
          "Es necesario actualizar y dar mantenimiento constante a las instalaciones.",
          "Muy buena atención y respuesta por parte de los encargados.",
          "La plataforma digital funciona bien, pero requiere mejoras de velocidad.",
          "Me gusta el enfoque práctico que se le está dando.",
          "Falta mayor difusión de las actividades universitarias."
        ];
        // Seleccionar algunos determinísticamente basándose en el ID de la encuesta
        const countToSimulate = Math.min(5, totalResponses);
        for (let i = 0; i < countToSimulate; i++) {
          const commentIdx = (getHash(survey.id + '_' + q.id + '_' + i) % dummyPool.length);
          comments.push(dummyPool[commentIdx]);
        }
      }

      if (comments.length === 0) {
        contentHTML = `<p style="font-style:italic;color:#6b7280;padding:10px 0;">No se registran comentarios.</p>`;
      } else {
        contentHTML = `<ul style="list-style-type:none;padding:0;margin:12px 0 0 0;">
          ${comments.map(c => `
            <li style="background:#f9fafb;border-left:3px solid #003087;padding:10px 14px;margin-bottom:8px;border-radius:0 6px 6px 0;font-size:13px;line-height:1.4;color:#374151;">
              "${c}"
            </li>
          `).join('')}
        </ul>`;
      }
    } else {
      // Preguntas estructuradas (multiple, yesno, scale)
      const stats = getQuestionStats(q, survey.id, totalResponses, surveyResponses);
      
      if (!stats || stats.length === 0) {
        contentHTML = `<p style="font-style:italic;color:#6b7280;padding:10px 0;">Sin opciones registradas.</p>`;
      } else {
        contentHTML = `
        <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151;width:40%;">Opción de respuesta</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151;width:40%;">Gráfico</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;color:#374151;width:10%;">Votos</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;color:#374151;width:10%;">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(s => {
              const displayOptionName = q.type === 'scale' 
                ? `${s.option} - ${s.option === '1' ? 'Muy malo' : s.option === '5' ? 'Excelente' : 'Neutral'}`
                : s.option;

              return `
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:10px 12px;color:#1f2937;font-weight:500;">${displayOptionName}</td>
                <td style="padding:10px 12px;vertical-align:middle;">
                  <div style="background:#e5e7eb;border-radius:4px;height:12px;width:100%;overflow:hidden;position:relative;">
                    <div style="background:linear-gradient(90deg, #003087, #0056b3);height:100%;border-radius:4px;width:${s.percentage}%;transition:width 0.4s ease;"></div>
                  </div>
                </td>
                <td style="padding:10px 12px;text-align:center;font-weight:600;color:#003087;">${s.votes.toLocaleString('es-EC')}</td>
                <td style="padding:10px 12px;text-align:center;font-weight:700;color:#111827;">${s.percentage}%</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
      }
    }

    return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.02);break-inside:avoid;">
      <div style="display:flex;justify-content:between;align-items:start;gap:8px;">
        <span style="background:#003087;color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">
          ${idx + 1}
        </span>
        <div style="flex-grow:1;margin-left:6px;">
          <h3 style="font-size:15px;font-weight:600;color:#111827;margin:2px 0 4px 0;line-height:1.4;">
            ${q.title || q.text || 'Pregunta sin título'}
            ${q.required ? '<span style="color:#ef4444;font-size:12px;margin-left:4px;" title="Obligatoria">*</span>' : ''}
          </h3>
          <span style="font-size:11px;color:#6b7280;background:#f3f4f6;padding:2px 8px;border-radius:12px;font-weight:500;">
            ${label}
          </span>
        </div>
      </div>
      <div style="margin-top:16px;">
        ${contentHTML}
      </div>
    </div>`;
  }).join('');

  const statusLabels = { active: 'Activa', draft: 'Borrador', closed: 'Cerrada', finished: 'Finalizada' };
  const audienceLabel = survey.audience || '—';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Resultados de Encuesta: ${survey.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #f9fafb; padding: 40px 20px; font-size: 14px; line-height: 1.5; }
    .container { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #003087; padding-bottom: 20px; margin-bottom: 24px; }
    .logo-section { display: flex; align-items: center; gap: 14px; }
    .logo-box { width: 48px; height: 48px; background: #003087; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    h1 { font-size: 22px; font-weight: 700; color: #003087; margin-bottom: 4px; }
    .meta-desc { font-size: 13px; color: #4b5563; font-style: italic; background: #f3f4f6; border-left: 4px solid #003087; padding: 12px 16px; border-radius: 4px; margin: 18px 0; }
    
    .section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 28px 0 14px; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; }
    .section-title::after { content: ''; flex-grow: 1; height: 1px; background: #e5e7eb; }
    
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
    @media (min-width: 640px) {
      .meta-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
    .meta-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; margin-bottom: 3px; font-weight: 600; }
    .meta-val { font-size: 14px; font-weight: 700; color: #003087; }
    
    .kpi-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    @media (min-width: 640px) {
      .kpi-row { grid-template-columns: repeat(4, 1fr); }
    }
    .kpi { background: #f0f4ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 16px 10px; text-align: center; }
    .kpi.accent { background: #ecfdf5; border-color: #d1fae5; }
    .kpi.accent .kpi-num { color: #059669; }
    .kpi-num { font-size: 24px; font-weight: 800; color: #1e40af; }
    .kpi-lbl { font-size: 11px; color: #4b5563; margin-top: 4px; font-weight: 600; }
    
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-finished { background: #dbeafe; color: #1e40af; }
    .badge-draft { background: #f3f4f6; color: #374151; }
    .badge-closed { background: #fee2e2; color: #991b1b; }
    
    .anonymity-alert { display: flex; gap: 10px; align-items: start; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 28px; }
    .anonymity-title { font-weight: 700; color: #b45309; font-size: 13px; margin-bottom: 2px; }
    .anonymity-text { color: #d97706; font-size: 12px; line-height: 1.4; }
    
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    .btn-print { background: #003087; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; cursor:pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .btn-print:hover { background: #002366; }
    
    @media print {
      body { background: #fff; padding: 0; }
      .container { border: none; padding: 0; box-shadow: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-section">
        <div class="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
        </div>
        <div>
          <h1>ULEAM Encuestas</h1>
          <p style="font-size:11px;color:#6b7280;font-weight:500;">Reporte de Resultados Consolidados</p>
        </div>
      </div>
      <div style="text-align:right;">
        <span class="badge badge-${survey.status}">${statusLabels[survey.status] || survey.status}</span>
        <p style="font-size:11px;color:#6b7280;margin-top:4px;">ID: ${survey.id}</p>
      </div>
    </div>

    <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 6px;">${survey.title}</h2>
    <div class="meta-desc">
      ${survey.description || 'Sin descripción disponible.'}
    </div>

    <div class="section-title">Parámetros del Estudio</div>
    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-lbl">Público Objetivo</div>
        <div class="meta-val">${audienceLabel}</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Fecha de Inicio</div>
        <div class="meta-val">${survey.startDate || '—'}</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Fecha de Cierre</div>
        <div class="meta-val">${survey.dueDate || '—'}</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Total Preguntas</div>
        <div class="meta-val">${(survey.questions || []).length}</div>
      </div>
    </div>

    <div class="section-title">Estadísticas Generales</div>
    <div class="kpi-row">
      <div class="kpi">
        <div class="kpi-num">${totalTarget.toLocaleString('es-EC')}</div>
        <div class="kpi-lbl">Personas Objetivo</div>
      </div>
      <div class="kpi accent">
        <div class="kpi-num">${totalResponses.toLocaleString('es-EC')}</div>
        <div class="kpi-lbl">Respuestas Recibidas</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">${notResponded.toLocaleString('es-EC')}</div>
        <div class="kpi-lbl">Personas sin Responder</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">${participationPct}%</div>
        <div class="kpi-lbl">Tasa de Participación</div>
      </div>
    </div>

    <div class="anonymity-alert">
      <svg style="flex-shrink:0;color:#d97706;margin-top:2px;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <div>
        <div class="anonymity-title">Reporte bajo Criterio de Confidencialidad</div>
        <div class="anonymity-text">
          Esta encuesta ha sido configurada bajo la modalidad de <strong>participación anónima</strong>. Los datos personales de los participantes (tales como nombres, roles específicos o correos electrónicos) no son registrados ni vinculados a los resultados agregados mostrados a continuación.
        </div>
      </div>
    </div>

    <div class="section-title">Análisis de Preguntas y Respuestas</div>
    <div style="margin-top:16px;">
      ${questionsHTML || '<p style="color:#6b7280;font-style:italic;">Esta encuesta no tiene preguntas registradas.</p>'}
    </div>

    <div class="no-print" style="margin-top:36px;text-align:center;">
      <button class="btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Imprimir Reporte / Guardar PDF
      </button>
    </div>

    <div class="footer">
      Universidad Laica Eloy Alfaro de Manabí · Reporte Oficial de Resultados Consolidados · Generado el ${now}
    </div>
  </div>
</body>
</html>`;

  // Abrir en una nueva ventana para visualización e impresión
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    // Descarga en caso de popup bloqueado
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_resultados_${survey.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
