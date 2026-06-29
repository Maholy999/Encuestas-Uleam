<script setup>
import { ref, watch } from 'vue';
import { store, showToast } from '../../store';
import { useI18n } from 'vue-i18n';
import emailjs from '@emailjs/browser';

const newFacultad = ref('');
const facultades = ref(store.facultades);
const showSuccessPerfil = ref(false);
const showSuccessPwd = ref(false);
const showSuccessPrefs = ref(false);

const perfil = ref({
  nombre: 'Carlos Rodríguez',
  email: 'c.rodriguez@live.uleam.edu.ec',
  cargo: 'Coordinador de calidad académica'
});

const pwd = ref({
  actual: '',
  nueva: '',
  confirm: ''
});

const addFacultad = () => {
  const val = newFacultad.value.trim();
  if (val && !facultades.value.includes(val)) {
    facultades.value.push(val);
    store.facultades = facultades.value;
    newFacultad.value = '';
  }
};

const delFacultad = (idx) => {
  facultades.value.splice(idx, 1);
  store.facultades = facultades.value;
};

// Toggle Dark Theme
const isDark = ref(document.body.classList.contains('dark'));
const toggleDark = (val) => {
  isDark.value = val;
  document.body.classList.toggle('dark', val);
};

const { t, locale } = useI18n();

// Prefs
const prefs = ref({
  idioma: localStorage.getItem('app_lang') || 'es',
  reminder: localStorage.getItem('app_reminder') === 'false' ? false : true,
  resumen: localStorage.getItem('app_resumen') === 'true' ? true : false
});

watch(() => prefs.value.idioma, (newLang) => {
  locale.value = newLang;
  localStorage.setItem('app_lang', newLang);
});

watch(() => prefs.value.reminder, (newVal) => {
  localStorage.setItem('app_reminder', newVal);
});

watch(() => prefs.value.resumen, (newVal) => {
  localStorage.setItem('app_resumen', newVal);
});

const savePerfil = () => {
  if (!perfil.value.nombre || !perfil.value.email) return;
  showSuccessPerfil.value = true;
  setTimeout(() => showSuccessPerfil.value = false, 3000);
};

const changePwd = () => {
  if (!pwd.value.actual || !pwd.value.nueva || !pwd.value.confirm) return;
  if (pwd.value.nueva !== pwd.value.confirm) {
    showToast("Las contraseñas no coinciden.", 'error');
    return;
  }
  pwd.value.actual = '';
  pwd.value.nueva = '';
  pwd.value.confirm = '';
  showSuccessPwd.value = true;
  setTimeout(() => showSuccessPwd.value = false, 3000);
};

const savePrefs = () => {
  showSuccessPrefs.value = true;
  setTimeout(() => showSuccessPrefs.value = false, 3000);
};

const lastBackupDate = ref(localStorage.getItem('app_last_backup') || 'Aún no se han realizado respaldos');
const backupStatus = ref(null); // null, 'loading', 'success', 'error'
const backupErrorMsg = ref('');

const doBackup = async () => {
  if (backupStatus.value === 'loading') return;
  backupStatus.value = 'loading';

  try {
    // 1. Extraer la base de datos (store) a un string JSON y minimizarlo
    const backupData = JSON.stringify(store);

    // 2. Descargar el respaldo localmente (en caso de que falle el correo por tamaño)
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_uleam_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 3. Configurar envío de EmailJS
    // NOTA: Debes reemplazar estos valores con tus credenciales reales de tu cuenta de EmailJS.
    // La plantilla debe tener una variable {{backup_data}} para inyectar el contenido.
    const serviceID = 'service_7eizmi5';
    const templateID = 'template_xpxwj7i';
    const publicKey = 'OrbESXIEZ2jjhyAjw';

    const templateParams = {
      to_email: 'hisoyma18@gmail.com',
      backup_data: backupData
    };

    // 3. Envío real a través de la API
    await emailjs.send(serviceID, templateID, templateParams, publicKey);

    backupStatus.value = 'success';
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    lastBackupDate.value = dateStr;
    localStorage.setItem('app_last_backup', dateStr);

  } catch (error) {
    console.error('Error al respaldar:', error);
    backupStatus.value = 'error';
    if (error && error.text) {
      backupErrorMsg.value = error.text;
    } else if (error && error.message) {
      backupErrorMsg.value = error.message;
    } else {
      backupErrorMsg.value = 'Ocurrió un error al enviar el respaldo';
    }
  } finally {
    // Restaurar el botón después de unos segundos si es éxito o error
    setTimeout(() => {
      if (backupStatus.value === 'success' || backupStatus.value === 'error') {
        backupStatus.value = null;
      }
    }, 4000);
  }
};

</script>

<template>
  <div class="admin-tab active">
    <div class="cfg-layout">
      <div class="crear-card">
        <div class="crear-card-hd">
          <i class="ti ti-user-circle"></i> {{ $t('admin.config.profile') }}
        </div>
        <div class="field-row-2">
          <div class="field-group">
            <label class="field-label" for="cfg-nombre">{{ $t('admin.config.name') }}</label>
            <input type="text" id="cfg-nombre" class="field-input" v-model="perfil.nombre" />
          </div>
          <div class="field-group">
            <label class="field-label" for="cfg-email">{{ $t('admin.config.email') }}</label>
            <input type="email" id="cfg-email" class="field-input" v-model="perfil.email" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label" for="cfg-cargo">{{ $t('admin.config.role') }}</label>
          <input type="text" id="cfg-cargo" class="field-input" v-model="perfil.cargo" />
        </div>
        <div class="row-actions">
          <button class="btn btn-primary btn-sm" @click="savePerfil">
            {{ $t('common.save') }}
          </button>
          <span class="field-success" v-if="showSuccessPerfil"><i class="ti ti-check"></i> {{ $t('admin.config.saved') }}</span>
        </div>
      </div>

      <div class="crear-card">
        <div class="crear-card-hd">
          <i class="ti ti-lock"></i> {{ $t('admin.config.changePwd') }}
        </div>
        <div class="field-group">
          <label class="field-label" for="cfg-pwd-actual">{{ $t('admin.config.currentPwd') }}</label>
          <input type="password" id="cfg-pwd-actual" class="field-input" placeholder="••••••••" v-model="pwd.actual" />
        </div>
        <div class="field-group">
          <label class="field-label" for="cfg-pwd-nueva">{{ $t('admin.config.newPwd') }}</label>
          <input type="password" id="cfg-pwd-nueva" class="field-input" placeholder="••••••••" v-model="pwd.nueva" />
          <span class="field-hint">{{ $t('admin.config.newPwdHint') }}</span>
        </div>
        <div class="field-group">
          <label class="field-label" for="cfg-pwd-confirm">{{ $t('admin.config.confirmPwd') }}</label>
          <input type="password" id="cfg-pwd-confirm" class="field-input" placeholder="••••••••" v-model="pwd.confirm" />
        </div>
        <div class="row-actions">
          <button class="btn btn-primary btn-sm" @click="changePwd">
            {{ $t('admin.config.changePwd') }}
          </button>
          <span class="field-success" v-if="showSuccessPwd"><i class="ti ti-check"></i> {{ $t('admin.config.pwdUpdated') }}</span>
        </div>
      </div>

      <div class="crear-card">
        <div class="crear-card-hd">
          <i class="ti ti-building-community"></i> {{ $t('admin.config.faculties') }}
        </div>
        <div class="facultades-list">
          <div class="fac-item" v-for="(f, i) in facultades" :key="f">
            <span>{{ f }}</span>
            <button class="fac-del-btn" @click="delFacultad(i)"><i class="ti ti-x"></i></button>
          </div>
        </div>
        <div class="field-row-2" style="margin-top: 10px">
          <input type="text" class="field-input" :placeholder="$t('admin.config.newFacultyPh')" v-model="newFacultad" @keydown.enter="addFacultad" />
          <button class="btn btn-primary btn-sm" @click="addFacultad">
            <i class="ti ti-plus"></i> {{ $t('admin.config.add') }}
          </button>
        </div>
      </div>

      <div class="crear-card">
        <div class="crear-card-hd">
          <i class="ti ti-settings"></i> {{ $t('admin.config.systemPrefs') }}
        </div>

        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-lbl"><i class="ti ti-language"></i> {{ $t('admin.config.lang') }}</div>
            <div class="pref-sub">{{ $t('admin.config.langSub') }}</div>
          </div>
          <select class="field-input sm-sel" v-model="prefs.idioma">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-lbl"><i class="ti ti-sun"></i> {{ $t('admin.config.theme') }}</div>
            <div class="pref-sub">{{ $t('admin.config.themeSub') }}</div>
          </div>
          <div class="theme-toggle-wrap">
            <button class="theme-btn" :class="{ active: !isDark }" @click="toggleDark(false)"><i class="ti ti-sun"></i> {{ $t('admin.config.themeLight') }}</button>
            <button class="theme-btn" :class="{ active: isDark }" @click="toggleDark(true)"><i class="ti ti-moon"></i> {{ $t('admin.config.themeDark') }}</button>
          </div>
        </div>

        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-lbl"><i class="ti ti-bell"></i> {{ $t('admin.config.autoReminder') }}</div>
            <div class="pref-sub">{{ $t('admin.config.autoReminderSub') }}</div>
          </div>
          <div class="tgl-switch" :class="{ on: prefs.reminder }" @click="prefs.reminder = !prefs.reminder"></div>
        </div>

        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-lbl"><i class="ti ti-mail"></i> {{ $t('admin.config.weeklySummary') }}</div>
            <div class="pref-sub">{{ $t('admin.config.weeklySummarySub') }}</div>
          </div>
          <div class="tgl-switch" :class="{ on: prefs.resumen }" @click="prefs.resumen = !prefs.resumen"></div>
        </div>

        <div class="pref-row" style="border-bottom: none">
          <div class="pref-info">
            <div class="pref-lbl"><i class="ti ti-database"></i> {{ $t('admin.config.backup') }}</div>
            <div class="pref-sub">{{ $t('admin.config.backupSub') }} {{ lastBackupDate }}</div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end;">
            <button class="btn btn-outline btn-sm" @click="doBackup" :disabled="backupStatus === 'loading'">
              <i class="ti" :class="{
                'ti-download': backupStatus === null,
                'ti-loader': backupStatus === 'loading',
                'ti-check': backupStatus === 'success',
                'ti-alert-circle': backupStatus === 'error'
              }" :style="backupStatus === 'loading' ? 'animation: spin 1s linear infinite' : ''"></i>
              <span v-if="backupStatus === null">{{ $t('admin.config.backupBtn') }}</span>
              <span v-else-if="backupStatus === 'loading'">Respaldo en proceso...</span>
              <span v-else-if="backupStatus === 'success'">Respaldo exitoso</span>
              <span v-else-if="backupStatus === 'error'">Error (Ver consola)</span>
            </button>
            <span v-if="backupStatus === 'success'" style="color:var(--success); font-size: 12px; margin-top: 4px;">Respaldo enviado a hisoyma18@gmail.com</span>
            <span v-if="backupStatus === 'error'" style="color:var(--danger); font-size: 12px; margin-top: 4px;">{{ backupErrorMsg }}</span>
          </div>
        </div>

        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border);">
          <div class="row-actions">
            <button class="btn btn-primary btn-sm" @click="savePrefs">
              {{ $t('admin.config.savePrefs') }}
            </button>
            <span class="field-success" v-if="showSuccessPrefs"><i class="ti ti-check"></i> {{ $t('admin.config.prefsSaved') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
