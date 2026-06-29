export const REGEX = {
  emailULEAM: /^[a-zA-Z0-9._%+\-]+@live\.uleam\.edu\.ec$/i,
  emailGeneric: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  password: /^[A-Z](?=.*\d).{7,}$/,
  nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,80}$/,
  textoGeneral: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s0-9.,;:'"()\-]{2,150}$/,
  soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.\-]{2,100}$/,
  fechaISO: /^\d{4}-\d{2}-\d{2}$/,
};

export const Validator = {
  notEmpty: (value) => typeof value === 'string' && value.trim().length > 0,
  matchesRegex: (value, regex) => typeof value === 'string' && regex.test(value.trim()),
  isType: (value, type) => type === 'array' ? Array.isArray(value) : typeof value === type,
  isValidDate: (str) => {
    if (!Validator.matchesRegex(str, REGEX.fechaISO)) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  },
  endAfterStart: (start, end) => {
    if (!Validator.isValidDate(start) || !Validator.isValidDate(end)) return false;
    return new Date(end) > new Date(start);
  }
};
