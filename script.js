const baseUrl = 'https://jsonplaceholder.typicode.com';

const selectEl = document.getElementById('albums');
const loaderEl = document.getElementById('loader');
const errorEl = document.getElementById('error-box');
const contentEl = document.getElementById('album-content');
const authorEl = document.getElementById('author');
const photosEl = document.getElementById('photos');

let albumsData = [];

async function loadInitialData() {
    loaderEl.textContent = 'Загрузка...';
    try {
        const response = await fetch(`${baseUrl}/albums`);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        
        albumsData = await response.json();
        
        let optionsHtml = '<option value="">Выберите альбом</option>';
        albumsData.forEach(function(album) {
            optionsHtml += `<option value="${album.id}">${album.title}</option>`;
        });
        
        selectEl.innerHTML = optionsHtml;
    } catch (err) {
        errorEl.textContent = err.message;
    } finally {
        loaderEl.textContent = '';
    }
}

selectEl.onchange = async function() {
    const selectedId = this.value;
    
    authorEl.innerHTML = '';
    photosEl.innerHTML = '';
    errorEl.textContent = '';

    if (!selectedId) {
        contentEl.style.display = 'none';
        return;
    }
    
    contentEl.style.display = 'block';
    loaderEl.textContent = 'Загрузка.....';

    const currentAlbum = albumsData.find(function(a) { 
        return a.id == selectedId; 
    });

    try {
        const [userRes, photosRes] = await Promise.all([
            fetch(`${baseUrl}/users/${currentAlbum.userId}`),
            fetch(`${baseUrl}/photos?albumId=${currentAlbum.id}`)
        ]);

        if (!userRes.ok || !photosRes.ok) {
            throw new Error('Не удалось получить данные с сервера');
        }

        const user = await userRes.json();
        const photos = await photosRes.json();

        authorEl.innerHTML = `
            <h2>Автор: ${user.name}</h2>
            <p><b>Username:</b> ${user.username}</p>
            <p><b>Email:</b> ${user.email}</p>
            <p><b>Фотографий в альбоме:</b> ${photos.length}</p>
        `;

        const fragment = document.createDocumentFragment();
        
        photos.forEach(function(photo) {
            const card = document.createElement('div');
            card.className = 'photo-card';
            
            const link = document.createElement('a');
            link.href = photo.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            const img = document.createElement('img');
            img.src = photo.thumbnailUrl;
            img.alt = photo.title;
            
            const caption = document.createElement('div');
            caption.className = 'photo-caption';
            caption.textContent = photo.title;
            caption.title = photo.title;
            
            link.appendChild(img);
            card.appendChild(link);
            card.appendChild(caption);
            fragment.appendChild(card);
        });

        photosEl.appendChild(fragment);

    } catch (err) {
        errorEl.textContent = err.message;
    } finally {
        loaderEl.textContent = '';
    }
};

window.addEventListener('DOMContentLoaded', loadInitialData);