import LoginPresenter from '../presenter/LoginPresenter';
import * as StoriesAPI from '../../data/api'; // Asumsi ini menangani panggilan login API
import * as AuthModel from '../../utils/auth'; // Asumsi ini menangani penyimpanan token
import Swal from 'sweetalert2'; // Untuk notifikasi pop-up yang menarik

export default class LoginPage {
    #presenter = null;

    async render() {
        return `
            <section class="login-container">
                <article class="login-form-container">
                  <h1 class="login__title">Masuk akun</h1>
        
                  <form id="login-form" class="login-form">
                    <div class="form-control">
                      <label for="email-input" class="login-form__email-title">Email</label>
        
                      <div class="login-form__title-container">
                        <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
                      </div>
                    </div>
                    <div class="form-control">
                      <label for="password-input" class="login-form__password-title">Password</label>
        
                      <div class="login-form__title-container password-input-container">
                        <input id="password-input" type="password" name="password" placeholder="Masukkan password Anda">
                        <span class="toggle-password" id="toggle-password">
                            <i class="fa fa-eye-slash" aria-hidden="true"></i>
                        </span>
                      </div>
                    </div>
                    <div class="form-buttons login-form__form-buttons">
                      <div id="submit-button-container">
                        <button class="btn" type="submit">Masuk</button>
                      </div>
                      <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar</a></p>
                    </div>
                  </form>
                </article>
            </section>
        `
    }

    async afterRender() {
        this.#presenter = new LoginPresenter({
            view: this,
            model: StoriesAPI,
            authModel: AuthModel,
        });

        this.#setupForm();
        this.#setupPasswordToggle(); // Add this line to setup the password toggle
    }

    #setupForm() {
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = {
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value
            };

            await this.#presenter.getLogin(data);
        });
    }

    // New method for password toggle
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

    loginSuccessfully(message) {
        Swal.fire({
            icon: 'success',
            title: 'Login Berhasil!',
            text: message,
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            location.hash = '/';
        });
    }

    loginFailed(message) {
        Swal.fire({
            icon: 'error',
            title: 'Login Gagal',
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
                <i class="fa fa-spinner loader-button"></i> Masuk
            </button>
        `
    }

    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Masuk</button>
        `
    }
}