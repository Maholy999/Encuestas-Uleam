<script setup>
import { ref } from 'vue';
import { loginUser, showToast } from '../store';
import { USERS } from '../store/demoData';
import { Validator, REGEX } from '../utils/validators';
import emailjs from '@emailjs/browser';

const email = ref('');
const password = ref('');
const errorEmail = ref('');
const errorPassword = ref('');
const showPassword = ref(false);

// Recovery State
const viewState = ref('login'); // 'login', 'forgot_email', 'forgot_code', 'forgot_newpwd'
const recoveryCode = ref('');
const inputCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const recoveryError = ref('');
const isRecovering = ref(false);

const demoLogin = (role) => {
  const user = USERS[role];
  if (user) loginUser(user);
};

const resolveRole = (emailStr) => {
  const lower = emailStr.toLowerCase();
  if (lower.startsWith('admin')) return 'sysadmin';
  if (lower.includes('docente') || lower.startsWith('dr') || lower.startsWith('msc')) return 'teacher';
  if (lower.includes('worker') || lower.includes('admin.') || lower.includes('secretaria')) return 'worker';
  return 'student';
};

const handleSubmit = () => {
  errorEmail.value = '';
  errorPassword.value = '';
  let valid = true;

  if (!Validator.notEmpty(email.value)) { errorEmail.value = 'El correo es obligatorio.'; valid = false; }
  else if (!Validator.matchesRegex(email.value, REGEX.emailGeneric)) { errorEmail.value = 'Formato de correo inválido.'; valid = false; }
  else if (!Validator.matchesRegex(email.value, REGEX.emailULEAM)) { errorEmail.value = 'El correo debe terminar en @live.uleam.edu.ec'; valid = false; }

  if (!Validator.notEmpty(password.value)) { errorPassword.value = 'La contraseña es obligatoria.'; valid = false; }
  else if (password.value.trim().length < 8) { errorPassword.value = 'La contraseña debe tener al menos 8 caracteres.'; valid = false; }
  else if (!/^[A-Z]/.test(password.value.trim())) { errorPassword.value = 'La contraseña debe iniciar con una letra mayúscula.'; valid = false; }
  else if (!Validator.matchesRegex(password.value, REGEX.password)) { errorPassword.value = 'Debe incluir al menos un número además de la mayúscula inicial.'; valid = false; }

  if (!valid) return;

  const role = resolveRole(email.value);
  const rawName = email.value.split('@')[0].replace(/[._]/g, ' ');
  const name = rawName.replace(/\b\w/g, c => c.toUpperCase());
  
  const roleLabels = {
    student: 'Estudiante',
    teacher: 'Docente',
    worker: 'Personal administrativo',
    sysadmin: 'Administrador',
  };

  const user = { name, email: email.value, role, roleLabel: roleLabels[role] };
  loginUser(user);
};

const handleForgot = (e) => {
  e.preventDefault();
  viewState.value = 'forgot_email';
  recoveryError.value = '';
};

const cancelRecovery = () => {
  viewState.value = 'login';
  recoveryError.value = '';
  inputCode.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};

const sendRecoveryEmail = async () => {
  recoveryError.value = '';
  if (!Validator.notEmpty(email.value) || !Validator.matchesRegex(email.value, REGEX.emailGeneric)) {
    recoveryError.value = 'Ingresa un correo válido primero.';
    return;
  }
  
  isRecovering.value = true;
  recoveryCode.value = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const serviceID = 'service_7eizmi5';
    const templateID = 'TU_TEMPLATE_RECOVERY'; // Placeholder que debe crear el usuario
    const publicKey = 'OrbESXIEZ2jjhyAjw';
    
    await emailjs.send(serviceID, templateID, {
      to_email: email.value,
      recovery_code: recoveryCode.value
    }, publicKey);
    
    viewState.value = 'forgot_code';
  } catch (error) {
    console.error('Error enviando código:', error);
    recoveryError.value = 'Error al enviar correo (¿Falta el Template ID de recuperación?)';
  } finally {
    isRecovering.value = false;
  }
};

const verifyCode = () => {
  recoveryError.value = '';
  if (inputCode.value === recoveryCode.value) {
    viewState.value = 'forgot_newpwd';
  } else {
    recoveryError.value = 'El código ingresado es incorrecto.';
  }
};

const saveNewPassword = () => {
  recoveryError.value = '';
  if (newPassword.value !== confirmPassword.value) {
    recoveryError.value = 'Las contraseñas no coinciden.';
    return;
  }
  if (newPassword.value.trim().length < 8) {
    recoveryError.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }
  
  // Simulamos actualización exitosa
  showToast('¡Contraseña actualizada con éxito!', 'success');
  cancelRecovery();
};

</script>

<template>
  <div id="screen-login" class="screen active">
    <div class="login-bg">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
    </div>
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-mark"><i class="ti ti-school"></i></div>
        <div>
          <span class="login-app-name">Encuestas ULEAM</span>
          <span class="login-uni-name">Universidad Laica Eloy Alfaro de Manabí</span>
        </div>
      </div>
      <h1 class="login-heading" v-if="viewState === 'login'">Bienvenido</h1>
      <h1 class="login-heading" style="font-size: 24px" v-else-if="viewState === 'forgot_email'">Recuperar Contraseña</h1>
      <h1 class="login-heading" style="font-size: 24px" v-else-if="viewState === 'forgot_code'">Verificar Código</h1>
      <h1 class="login-heading" style="font-size: 24px" v-else-if="viewState === 'forgot_newpwd'">Nueva Contraseña</h1>

      <!-- SUBTITLES -->
      <p class="login-sub" v-if="viewState === 'login'">Ingresa con tu correo institucional para acceder al sistema.</p>
      <p class="login-sub" v-else-if="viewState === 'forgot_email'">Ingresa tu correo para recibir un código de recuperación.</p>
      <p class="login-sub" v-else-if="viewState === 'forgot_code'">Hemos enviado un código de 6 dígitos a tu correo.</p>
      <p class="login-sub" v-else-if="viewState === 'forgot_newpwd'">Crea tu nueva contraseña de acceso seguro.</p>

      <!-- LOGIN FORM -->
      <form id="login-form" @submit.prevent="handleSubmit" novalidate v-if="viewState === 'login'">
        <div class="field-group">
          <label class="field-label" for="login-email">Correo institucional <span class="req">*</span></label>
          <div class="input-wrap">
            <i class="ti ti-mail input-icon"></i>
            <input type="email" id="login-email" v-model="email" class="field-input" :class="{ error: errorEmail }" placeholder="nombre@live.uleam.edu.ec" autocomplete="email"/>
          </div>
          <span class="field-error" role="alert" v-if="errorEmail">{{ errorEmail }}</span>
        </div>
        <div class="field-group">
          <label class="field-label" for="login-password">Contraseña <span class="req">*</span></label>
          <div class="input-wrap">
            <i class="ti ti-lock input-icon"></i>
            <input :type="showPassword ? 'text' : 'password'" id="login-password" v-model="password" class="field-input" :class="{ error: errorPassword }" placeholder="••••••••" autocomplete="current-password"/>
            <button type="button" class="pwd-toggle" @click="showPassword = !showPassword"><i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i></button>
          </div>
          <span class="field-error" role="alert" v-if="errorPassword">{{ errorPassword }}</span>
        </div>
        <div class="login-opts">
          <label class="checkbox-label"><input type="checkbox" id="remember-me" /> Recordarme</label>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Ingresar al sistema <i class="ti ti-arrow-right"></i></button>
      </form>

      <!-- FORGOT EMAIL FORM -->
      <form @submit.prevent="sendRecoveryEmail" novalidate v-else-if="viewState === 'forgot_email'">
        <div class="field-group">
          <label class="field-label">Correo institucional</label>
          <div class="input-wrap">
            <i class="ti ti-mail input-icon"></i>
            <input type="email" v-model="email" class="field-input" :class="{ error: recoveryError }" placeholder="nombre@live.uleam.edu.ec" />
          </div>
          <span class="field-error" v-if="recoveryError">{{ recoveryError }}</span>
        </div>
        <div style="display:flex; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-outline" style="flex:1" @click="cancelRecovery" :disabled="isRecovering">Cancelar</button>
          <button type="submit" class="btn btn-primary" style="flex:1" :disabled="isRecovering">{{ isRecovering ? 'Enviando...' : 'Enviar código' }}</button>
        </div>
      </form>

      <!-- FORGOT CODE FORM -->
      <form @submit.prevent="verifyCode" novalidate v-else-if="viewState === 'forgot_code'">
        <div class="field-group">
          <label class="field-label">Código de 6 dígitos</label>
          <div class="input-wrap">
            <i class="ti ti-number input-icon"></i>
            <input type="text" v-model="inputCode" class="field-input" :class="{ error: recoveryError }" placeholder="123456" maxlength="6" />
          </div>
          <span class="field-error" v-if="recoveryError">{{ recoveryError }}</span>
        </div>
        <div style="display:flex; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-outline" style="flex:1" @click="cancelRecovery">Cancelar</button>
          <button type="submit" class="btn btn-primary" style="flex:1">Verificar</button>
        </div>
      </form>

      <!-- FORGOT NEW PWD FORM -->
      <form @submit.prevent="saveNewPassword" novalidate v-else-if="viewState === 'forgot_newpwd'">
        <div class="field-group">
          <label class="field-label">Nueva contraseña</label>
          <input type="password" v-model="newPassword" class="field-input" placeholder="••••••••" />
        </div>
        <div class="field-group">
          <label class="field-label">Confirmar contraseña</label>
          <input type="password" v-model="confirmPassword" class="field-input" placeholder="••••••••" />
          <span class="field-error" v-if="recoveryError">{{ recoveryError }}</span>
        </div>
        <div style="display:flex; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-outline" style="flex:1" @click="cancelRecovery">Cancelar</button>
          <button type="submit" class="btn btn-primary" style="flex:1">Guardar cambios</button>
        </div>
      </form>

      <p class="login-footer-text" v-if="viewState === 'login'">
        ¿Problemas para ingresar? Escríbenos a soporte técnico:<br/>
        <a href="mailto:soporteUleam@gmail.com" class="link-text" style="display:inline-block; margin-top:4px; user-select: all;">soporteUleam@gmail.com</a>
      </p>
      
      <div class="demo-bar" v-if="viewState === 'login'">
        <span class="demo-bar-lbl">Acceso rápido (demo):</span>
        <button class="demo-btn" @click="demoLogin('student')">Estudiante</button>
        <button class="demo-btn" @click="demoLogin('teacher')">Docente</button>
        <button class="demo-btn" @click="demoLogin('worker')">Trabajador ULEAM</button>
        <button class="demo-btn" @click="demoLogin('sysadmin')">Administrador</button>
      </div>
    </div>
  </div>
</template>
