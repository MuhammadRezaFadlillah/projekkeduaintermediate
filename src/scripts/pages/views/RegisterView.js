import * as StoriesAPI from '../../data/api';
import RegisterPresenter from '../presenter/RegisterPresenter';
import Swal from 'sweetalert2';

export default class RegisterPage {
    #presenter = null;

    async render() {
        return `
            <section class="register-container">
                <div class="register-form-container">
                    <h1 class="register__title">Daftar Akun</h1>
                    
                    <form id="register-form" class="register-from">
                        <div class="form-control">
                            <label for="name-input" class="register-from__name_title">Nama Lengkap</label>
                            
                            <div class="register-form__title-container">
                                <input id="name-input" type="text" name="name" placeholder="Masukkan nama lengkap Anda">
                            </div>
                        </div>
                        <div class="form-control">
                          <label for="email-input" class="register-form__email-title">Email</label>
            
                          <div class="register-form__title-container">
                            <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
                          </div>
                        </div>
                        <div class="form-control">
                          <label for="password-input" class="register-form__password-title">Password</label>
            
                          <div class="register-form__title-container password-input-container">
                            <input id="password-input" type="password" name="password" placeholder="Masukkan password baru">
                            <span class="toggle-password" id="toggle-password">
                                <i class="fa fa-eye-slash" aria-hidden="true"></i>
                            </span>
                          </div>
                        </div>
                        <div class="form-buttons register-form__form-buttons">
                          <div id="submit-button-container">
                            <button class="btn" type="submit">Daftar akun</button>
                          </div>
                          <p class="register-form__already-have-account">Sudah punya akun? <a href="#/login">Masuk</a></p>
                        </div>
                    </form>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new RegisterPresenter({
            view: this,
            model: StoriesAPI
        });

        this.#setupForm();
        this.#setupPasswordToggle(); // New method for password toggle
    }

    #setupForm() {
        document.getElementById("register-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const data = {
                name: document.getElementById('name-input').value,
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value
            };

            await this.#presenter.getRegistered(data);
        });
    }

    #setupPasswordToggle() {
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password-input');

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                // Toggle the type attribute
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle the eye icon
                togglePassword.querySelector('i').classList.toggle('fa-eye');
                togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    }

    registeredSuccessfully(message) {
        Swal.fire({
            icon: 'success',
            title: 'Registrasi Berhasil!',
            text: message,
            showConfirmButton: false,
            timer: 2000 // Close after 2 seconds
        }).then(() => {
            location.hash = '/login'; // Redirect to login page after success
        });
    }

    registeredFailed(message) {
        Swal.fire({
            icon: 'error',
            title: 'Registrasi Gagal',
            text: message,
            confirmButtonText: 'Oke',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('User acknowledged the error.');
            }
        });
    }

    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <i class="fa fa-spinner loader-button"></i> Daftar Akun
            </button>
        `
    }

    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Daftar Akun</button>
        `
    }
}