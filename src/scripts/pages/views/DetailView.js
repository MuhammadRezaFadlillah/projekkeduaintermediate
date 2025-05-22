import DetailPresenter from '../presenter/DetailPresenter';
import { parseActivePathname } from '../../routes/url-parser';
import * as StoriesAPI from '../../data/api';
import {
    generateLoaderAbsoluteTemplate,
    generateRemoveStoryButtonTemplate,
    generateSaveStoryButtonTemplate,
    generateStoryDetailErrorTemplate,
    generateStoryDetailTemplate,
} from '../../template';
import Map from '../../utils/map';
import Swal from 'sweetalert2';
import Database from '../../data/database';

export default class DetailPage {
    #presenter = null;
    #map = null;

    async render() {
        return `
            <section>
                <div class="story-detail__container">
                    <div id="story-detail" class="story-detail"></div>
                    <div id="story-detail-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new DetailPresenter(parseActivePathname().id, {
            view: this,
            apiModel: StoriesAPI,
            dbModel: Database,
        });

        this.#presenter.showStoryDetail()
    }

    async populateStoryDetailAndInitialMap(message, story) {
        document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
            authorName: story.name,
            description: story.description,
            image: story.photoUrl,
            createdAt: story.createdAt,
            location: story.location,
        });

        if (story.location.latitude !== null && story.location.longitude !== null) {
            try {
                await this.#presenter.showStoryDetailMap();

                if (this.#map) {
                    const coordinate = [story.location.latitude, story.location.longitude];
                    const markerOptions = { alt: story.description };
                    const popupOptions = { content: story.description };

                    this.#map.changeCamera(coordinate);
                    this.#map.addMarker(coordinate, markerOptions, popupOptions);
                }
            } catch (error) {
                setTimeout(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: 'Terjadi kesalahan saat memuat peta.',
                        footer: `<small>Error: ${error.message}</small>`
                    });
                }, 500)
            }
        } else {
            setTimeout(() => {
                Swal.fire({
                    icon: 'info',
                    title: 'Lokasi tidak tersedia',
                    text: 'Koordinat tidak ditemukan untuk cerita ini.',
                });
            }, 500)
        }

        this.#presenter.showSaveButton();
    }

    populateStoryDetailError(message) {
        document.getElementById('story-detail').innerHTML = generateStoryDetailErrorTemplate(message)
    }

    async initialMap() {
        console.log('Memulai peta...');
        this.#map = await Map.build('#map', {
            zoom: 15,
        })
        console.log('Peta berhasil dibuat:', this.#map);
    }

    renderSaveButton() {
        document.getElementById('save-actions-container').innerHTML = generateSaveStoryButtonTemplate();

        document.getElementById('story-detail-save').addEventListener('click', async () => {
            await this.#presenter.saveStory();
            await this.#presenter.showSaveButton();
        })
    }

    renderRemoveButton() {
        document.getElementById('save-actions-container').innerHTML =
            generateRemoveStoryButtonTemplate();

        document.getElementById('story-detail-remove').addEventListener('click', async () => {
            const result = await Swal.fire({
                title: 'Apakah Anda yakin?',
                text: "Cerita ini akan dihapus dari bookmark Anda!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Ya, hapus!',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                await this.#presenter.removeReport();
                await this.#presenter.showSaveButton();
            }
        });
    }

    saveToBookmarkSuccessfully(message) {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Ditambahkan!',
            text: message || 'Cerita berhasil ditambahkan ke bookmark.', // Default message if not provided
            showConfirmButton: false,
            timer: 1500
        });
    }

    saveToBookmarkFailed(message) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: message || 'Terjadi kesalahan saat menambahkan cerita ke bookmark.', // Default message if not provided
            confirmButtonText: 'Oke',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('Pengguna mengakui kesalahan.');
            }
        });
    }

    removeFromBookmarkSuccessfully(message) {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus!',
            text: message || 'Cerita berhasil dihapus dari bookmark.', // Default message if not provided
            showConfirmButton: false,
            timer: 1500
        });
    }

    removeFromBookmarkFailed(message) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: message || 'Terjadi kesalahan saat menghapus cerita dari bookmark.', // Default message if not provided
            confirmButtonText: 'Oke',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('Pengguna mengakui kesalahan.');
            }
        });
    }

    showStoryDetailLoading() {
        document.getElementById('story-detail-loading-container').innerHTML =
            generateLoaderAbsoluteTemplate();
    }

    hideStoryDetailLoading() {
        document.getElementById('story-detail-loading-container').innerHTML = '';
    }

    showMapLoading() {
        document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideMapLoading() {
        document.getElementById('map-loading-container').innerHTML = '';
    }
}