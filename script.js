const musicData = [
    {
        id: 1,
        title: "Nonstop Mashup 2025",
        artist: "Talha Anjum, Talwiinder, Atif Aslam",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80&auto=format&fit=crop",
        source: "songs/Nonstop_Mashup_2025___Talha_Anjum,_Talwiinder,_Atif_Aslam_ft._Taimour_Baig___Jukebox___AWAID___AWAIS(128k).m4a.mpeg"
    },
    {
        id: 2,
        title: "Sahiba",
        artist: "Aditya Rikhari",
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&q=80&auto=format&fit=crop",
        source: "songs/Sahiba_Lyrics_-_Aditya_Rikhari_•_saahiba,_aaye_ghar_kaahe_na(128k).m4a.mpeg"
    },
    {
        id: 3,
        title: "Haseen",
        artist: "Talwiinder",
        cover: "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=500&q=80&auto=format&fit=crop",
        source: "songs/Talwiinder_-_Haseen_Lyrics___NDS___Rippy_Grewal___@SN_Entertain(128k).m4a.mpeg"
    },
    {
        id: 4,
        title: "Hassan Raheem",
        artist: "Hassan Raheem",
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&auto=format&fit=crop",
        source: "songs/Hassan Raheem.mpeg"
    },
    {
        id: 5,
        title: "Angaraiyan",
        artist: "Unknown",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop",
        source: "songs/Angaraiyan.mpeg"
    },
    {
        id: 6,
        title: "Tere Liye, Atif Aslam",
        artist: "Atif Aslam",
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&auto=format&fit=crop",
        source: "songs/Tere Liye, Atif Aslam.mpeg"
    },
    {
        id: 7,
        title: "LeLe maza Le",
        artist: "Unknown",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&auto=format&fit=crop",
        source: "songs/LeLe maza Le.mpeg"
    }
];

let allSongs = [...musicData];
let playlists = JSON.parse(localStorage.getItem('vibeStream_playlists')) || {
    "My Favorites": []
};
let currentSongs = allSongs;
let trackIndex = 0;
let isPlaying = false;
let animationId = null;
let activePlaylistName = "Library";
let isLibraryVisible = true;
let isPlaylistsVisible = true;

const audio = document.getElementById('audio-player');
audio.onerror = () => {
    console.error("Audio Load Error:", audio.error);
    alert("Error: Could not load audio. Please check if the file exists and is a valid audio format.");
};
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const trackImage = document.getElementById('track-image');
const volumeSlider = document.getElementById('volume-slider');
const heartBtn = document.getElementById('heart-btn');
const fileInput = document.getElementById('file-input');

const toggleLibraryBtn = document.getElementById('toggle-library');
const togglePlaylistsBtn = document.getElementById('toggle-playlists');
const librarySidebar = document.getElementById('library-sidebar');
const playlistsSidebar = document.getElementById('playlists-sidebar');

const libraryItems = document.getElementById('playlist-items');
const userPlaylistsList = document.getElementById('user-playlists');
const playlistSongsList = document.getElementById('playlist-songs');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const backToPlaylistsBtn = document.getElementById('back-to-playlists');
const deletePlaylistBtn = document.getElementById('delete-playlist-btn');
const currentPlaylistNameEl = document.getElementById('current-playlist-name');
const playlistsListView = document.getElementById('playlists-list-view');
const playlistDetailView = document.getElementById('playlist-detail-view');

function loadTrack(index) {
    const track = currentSongs[index];
    if (!track) return;

    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    trackImage.src = track.cover;
    audio.src = track.source;

    const isFavorite = playlists["My Favorites"].some(s => s.id === track.id);
    heartBtn.classList.toggle('active', isFavorite);
    heartBtn.querySelector('i').className = isFavorite ? 'fas fa-heart' : 'far fa-heart';

    progressBar.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    updateActiveUI();
}

function updateActiveUI() {
    const allItems = document.querySelectorAll('.playlist-item');
    allItems.forEach(item => {
        const itemId = parseInt(item.getAttribute('data-id'));
        const currentTrack = currentSongs[trackIndex];
        item.classList.toggle('active', currentTrack && itemId === currentTrack.id);
    });
}

function savePlaylists() {
    localStorage.setItem('vibeStream_playlists', JSON.stringify(playlists));
}

function renderLibrary() {
    libraryItems.innerHTML = '';
    allSongs.forEach(track => {
        const li = createSongItem(track, 'library');
        libraryItems.appendChild(li);
    });
}

function renderPlaylists() {
    userPlaylistsList.innerHTML = '';
    Object.keys(playlists).forEach(name => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.innerHTML = `
            <div class="item-thumb" style="background: linear-gradient(45deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fas fa-music"></i>
            </div>
            <div class="item-info">
                <span class="item-name">${name}</span>
                <span class="item-artist">${playlists[name].length} songs</span>
            </div>
        `;
        li.onclick = () => showPlaylistDetail(name);
        userPlaylistsList.appendChild(li);
    });
}

function createSongItem(track, type, playlistName = '') {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    li.setAttribute('data-id', track.id);

    let actionButtons = '';
    if (type === 'library') {
        actionButtons = `<button class="item-action-btn add" title="Add to Playlist"><i class="fas fa-plus"></i></button>`;
    } else {
        actionButtons = `<button class="item-action-btn remove" title="Remove"><i class="fas fa-times"></i></button>`;
    }

    li.innerHTML = `
        <img src="${track.cover}" alt="${track.title}" class="item-thumb" loading="lazy">
        <div class="item-info">
            <span class="item-name">${track.title}</span>
            <span class="item-artist">${track.artist}</span>
        </div>
        <div class="item-actions">${actionButtons}</div>
    `;

    li.onclick = (e) => {
        if (e.target.closest('.item-action-btn')) return;
        currentSongs = type === 'library' ? allSongs : playlists[playlistName];
        activePlaylistName = type === 'library' ? "Library" : playlistName;
        trackIndex = currentSongs.findIndex(s => s.id === track.id);
        loadTrack(trackIndex);
        playTrack();

        if (window.innerWidth <= 768) {
            document.body.classList.remove('show-playlists');
            document.body.classList.add('show-player');
        }
    };

    if (type === 'library') {
        li.querySelector('.add').onclick = (e) => {
            e.stopPropagation();
            const pNames = Object.keys(playlists);
            if (pNames.length === 0) return alert("Create a playlist first!");
            const choice = prompt(`Add to which playlist?\nOptions: ${pNames.join(', ')}`);
            if (choice && playlists[choice]) {
                if (!playlists[choice].some(s => s.id === track.id)) {
                    playlists[choice].push(track);
                    savePlaylists();
                    renderPlaylists();
                    if (activePlaylistName === choice) showPlaylistDetail(choice);
                }
            }
        };
    } else {
        li.querySelector('.remove').onclick = (e) => {
            e.stopPropagation();
            playlists[playlistName] = playlists[playlistName].filter(s => s.id !== track.id);
            savePlaylists();
            showPlaylistDetail(playlistName);
            renderPlaylists();
        };
    }
    return li;
}

function showPlaylistDetail(name) {
    activePlaylistName = name;
    currentPlaylistNameEl.textContent = name;
    playlistSongsList.innerHTML = '';
    playlists[name].forEach(track => {
        playlistSongsList.appendChild(createSongItem(track, 'playlist', name));
    });
    playlistsListView.classList.remove('active');
    playlistDetailView.classList.add('active');

    if (window.innerWidth <= 768) {
        document.body.classList.remove('show-player');
        document.body.classList.add('show-playlists');
    } else if (!isPlaylistsVisible) {
        togglePlaylists();
    }
}

function toggleLibrary() {
    if (window.innerWidth <= 768) {
        document.body.classList.remove('show-player', 'show-playlists');
    } else {
        isLibraryVisible = !isLibraryVisible;
        librarySidebar.classList.toggle('hidden', !isLibraryVisible);
    }
}

function togglePlaylists() {
    if (window.innerWidth <= 768) {
        if (document.body.classList.contains('show-playlists')) {
            document.body.classList.remove('show-playlists');
            document.body.classList.add('show-player');
        } else {
            document.body.classList.remove('show-player');
            document.body.classList.add('show-playlists');
        }
    } else {
        isPlaylistsVisible = !isPlaylistsVisible;
        playlistsSidebar.classList.toggle('hidden', !isPlaylistsVisible);
    }
}

function playTrack() {
    console.log("Attempting to play:", audio.src, "Volume:", audio.volume);
    isPlaying = true;
    audio.play().catch(err => {
        console.error("Playback failed:", err);
    });
    playBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(updateSmoothProgress);
}

function pauseTrack() {
    isPlaying = false;
    audio.pause();
    playBtn.innerHTML = `<i class="fas fa-play"></i>`;
    if (animationId) cancelAnimationFrame(animationId);
}

function prevTrack() {
    trackIndex = (trackIndex - 1 + currentSongs.length) % currentSongs.length;
    loadTrack(trackIndex);
    if (isPlaying) playTrack();
}

function nextTrack() {
    trackIndex = (trackIndex + 1) % currentSongs.length;
    loadTrack(trackIndex);
    if (isPlaying) playTrack();
}

function updateSmoothProgress() {
    if (!isPlaying) return;
    const { duration, currentTime } = audio;
    if (duration) {
        progressBar.style.width = `${(currentTime / duration) * 100}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
    animationId = requestAnimationFrame(updateSmoothProgress);
}

function formatTime(time) {
    const min = Math.floor(time / 60) || 0;
    const sec = Math.floor(time % 60) || 0;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

playBtn.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());
prevBtn.addEventListener('click', () => {
    trackIndex = (trackIndex - 1 + currentSongs.length) % currentSongs.length;
    loadTrack(trackIndex);
    if (isPlaying) playTrack();
});
nextBtn.addEventListener('click', () => {
    trackIndex = (trackIndex + 1) % currentSongs.length;
    loadTrack(trackIndex);
    if (isPlaying) playTrack();
});
audio.addEventListener('ended', () => nextBtn.click());

progressContainer.addEventListener('click', (e) => {
    if (audio.duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
});

volumeSlider.addEventListener('input', () => {
    const val = volumeSlider.value;
    audio.volume = val;
    const icon = document.getElementById('volume-icon');
    if (val == 0) icon.className = 'fas fa-volume-mute';
    else if (val < 0.5) icon.className = 'fas fa-volume-low';
    else icon.className = 'fas fa-volume-high';
});

toggleLibraryBtn.addEventListener('click', toggleLibrary);
document.getElementById('mobile-back-btn').addEventListener('click', toggleLibrary);
document.getElementById('mobile-playlists-back-btn').addEventListener('click', togglePlaylists);
togglePlaylistsBtn.addEventListener('click', togglePlaylists);

backToPlaylistsBtn.addEventListener('click', () => {
    playlistDetailView.classList.remove('active');
    playlistsListView.classList.add('active');
});

createPlaylistBtn.addEventListener('click', () => {
    const name = prompt("New playlist name:");
    if (name && !playlists[name]) {
        playlists[name] = [];
        savePlaylists();
        renderPlaylists();
        alert("Playlist created! Use the '+' in the Library (left) to add songs.");
    }
});

deletePlaylistBtn.addEventListener('click', () => {
    const name = currentPlaylistNameEl.textContent;
    if (name === "My Favorites") return alert("Cannot delete Favorites");
    if (confirm(`Delete "${name}"?`)) {
        delete playlists[name];
        savePlaylists();
        renderPlaylists();
        backToPlaylistsBtn.click();
    }
});

document.getElementById('add-song-btn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const newTrack = {
            id: Date.now(),
            title: file.name.split('.').slice(0, -1).join('.'),
            artist: "Local File",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80&auto=format&fit=crop",
            source: URL.createObjectURL(file)
        };
        allSongs.push(newTrack);
        renderLibrary();
    }
});

heartBtn.addEventListener('click', () => {
    const track = currentSongs[trackIndex];
    if (!track) return;
    const favs = playlists["My Favorites"];
    const idx = favs.findIndex(s => s.id === track.id);
    if (idx === -1) favs.push(track);
    else favs.splice(idx, 1);
    savePlaylists();
    loadTrack(trackIndex);
    renderPlaylists();
});

loadTrack(trackIndex);
renderLibrary();
renderPlaylists();
audio.volume = volumeSlider.value;
