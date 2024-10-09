let currentSongIndex = 0;
let isShuffling = false;
let isRepeating = false;
// --------------------------------------------------------

const songListElement = document.getElementById("song-list");
const searchBar = document.getElementById("search-bar");

// for storing the song list that can be restored after search function
const initialSongs = [...songs];

// ----------------------------------------------------------

const musicPlayer = document.querySelector(".music-player");

// updates dynamically the background gradient color
function updateMusicPlayerBackground(songColor) {
  // Ensure the color is valid and update the background gradient
  if (songColor) {
    musicPlayer.style.backgroundImage = `linear-gradient(180deg, ${songColor}, black)`;
  } else {
    // Fallback if no color is provided
    musicPlayer.style.backgroundImage =
      "linear-gradient(180deg, #f806cc, black)";
  }
}

// ------------------------------------------------------------

const audioPlayer = document.getElementById("audio-player");
const songImage = document.getElementById("song-image");

// displays the current song and its image in the music-player
function loadSong(songIndex) {
  const selectedSong = songs[songIndex];
  audioPlayer.src = selectedSong.file;
  document.getElementById("current-song-title").textContent = selectedSong.name;
  document.getElementById("current-singer").textContent = selectedSong.singer;
  songImage.src = selectedSong.image;

  updateMusicPlayerBackground(selectedSong.color);
}

// ---------------------------------------------------------------

const customSlider = document.getElementById("custom-slider");
const currentTimeElement = document.getElementById("current-time");
const totalDurationElement = document.getElementById("total-duration");

// formating the play time of the song in the format of m:s
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

// updates the slider as the song plays
audioPlayer.addEventListener("timeupdate", function () {
  // Update current time
  currentTimeElement.textContent = formatTime(audioPlayer.currentTime);

  // Update total duration (once the metadata is loaded)
  if (!isNaN(audioPlayer.duration)) {
    totalDurationElement.textContent = formatTime(audioPlayer.duration);
  }

  const value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  customSlider.value = value;

  // Changes slider color dynamically
  const gradientColor = `linear-gradient(90deg, #f806cc ${value}%, white ${value}%)`;
  customSlider.style.background = gradientColor;
});

// Update song time when user interacts with the slider
customSlider.addEventListener("input", function () {
  const newTime = (customSlider.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
});

// --------------------------------------------------------------------------

const volumeBtn = document.getElementById("volume-btn");
const volumeSlider = document.getElementById("volume-slider");

// Toggle volume slider visibility
volumeBtn.addEventListener("click", function () {
  volumeSlider.classList.toggle("d-none");
});

// Adjust volume
volumeSlider.addEventListener("input", function () {
  audioPlayer.volume = volumeSlider.value / 100;
});

// -----------------------------------------------------------------

const playPauseBtn = document.getElementById("play-pause-btn");
const playPauseIcon = playPauseBtn.querySelector("i");

// function to toggle between play and pause in the main player
function togglePlayPause() {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseIcon.classList.remove("fa-play");
    playPauseIcon.classList.add("fa-pause");
  } else {
    audioPlayer.pause();
    playPauseIcon.classList.remove("fa-pause");
    playPauseIcon.classList.add("fa-play");
  }
}

// Function to update the main play/pause button
function updatePlayPauseIcon() {
  if (audioPlayer.paused) {
    playPauseIcon.classList.remove("fa-pause");
    playPauseIcon.classList.add("fa-play");
  } else {
    playPauseIcon.classList.remove("fa-play");
    playPauseIcon.classList.add("fa-pause");
  }
}

// functionality for the previous button
function playPrevious() {
  currentSongIndex =
    currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1;
  loadSong(currentSongIndex);
  audioPlayer.play();
  updatePlayPauseIcon();
}

// function for the shuffle button
function toggleShuffle() {
  isShuffling = !isShuffling;
  const shuffleBtn = document.getElementById("shuffle-btn");

  if (isShuffling) {
    shuffleBtn.style.backgroundColor = "#f806cc";
  } else {
    shuffleBtn.style.backgroundColor = "white";
  }

  shuffleBtn.classList.toggle("active", isShuffling);
}

// for shuffling the songs and to play the next random song from the list
function playNext() {
  if (isShuffling) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentSongIndex);
    currentSongIndex = randomIndex;
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  loadSong(currentSongIndex);
  audioPlayer.play();
  updatePlayPauseIcon();
}

// function for the repeat button
function toggleRepeat() {
  isRepeating = !isRepeating;
  const repeatBtn = document.getElementById("repeat-btn");

  if (isRepeating) {
    repeatBtn.style.backgroundColor = "#f806cc"; // Purple shade
  } else {
    repeatBtn.style.backgroundColor = "white";
  }

  repeatBtn.classList.toggle("active", isRepeating);
}

// to handle song endings according to the buttons(repeat or shuffle) selected
audioPlayer.onended = () => {
  if (isRepeating) {
    loadSong(currentSongIndex);
    audioPlayer.play();
  } else if (isShuffling) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
    loadSong(currentSongIndex);
    audioPlayer.play();
  } else {
    playNext();
  }
};

// ---------------------------------------------------------------

// Seach bar functionality
searchBar.oninput = function () {
  const query = this.value.toLowerCase();
  songListElement.innerHTML = "";

  // filters the songs and displays the matching ones
  const filteredSongs = songs.filter((s) =>
    s.name.toLowerCase().includes(query)
  );

  filteredSongs.forEach((song, index) => {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "bg-transparent",
      "text-white",
      "mb-0",
      "song-item"
    );
    li.style.cursor = "pointer";

    li.textContent = song.name;
    li.onclick = () => playSongFromList(songs.indexOf(song));

    songListElement.appendChild(li);
  });
};

// Function to play the song when its clicked from the song list
function playSongFromList(songIndex) {
  currentSongIndex = songIndex;
  loadSong(songIndex);
  audioPlayer.play();
  updatePlayPauseIcon();
}

// when clicked outside the searchbar..restores the song list
document.addEventListener("click", function (event) {
  const isClickInside =
    searchBar.contains(event.target) || songListElement.contains(event.target);
  if (!isClickInside) {
    searchBar.value = "";
    generateSongList();
  }
});

// ------------------------------------------------------------------------

// song list
function generateSongList() {
  songListElement.innerHTML = "";

  initialSongs.forEach((song, index) => {
    const li = document.createElement("li");
    li.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "bg-transparent",
      "text-white",
      "mb-0",
      "song-item",
      "border-bottom",
      "p-2"
    );

    const songInfo = document.createElement("div");
    songInfo.classList.add("d-flex", "align-items-left");

    const songImg = document.createElement("img");
    songImg.src = song.image;
    songImg.alt = song.name;
    songImg.style.width = "40px";
    songImg.style.height = "40px";
    songImg.classList.add("mr-3");

    const textContainer = document.createElement("div");
    textContainer.classList.add("d-flex", "flex-column");

    const songName = document.createElement("span");
    songName.textContent = song.name;
    songName.classList.add("font-weight-bold");

    const singerName = document.createElement("small");
    singerName.textContent = song.singer;
    singerName.classList.add("text-muted");

    textContainer.appendChild(songName);
    textContainer.appendChild(singerName);

    songInfo.appendChild(songImg);
    songInfo.appendChild(textContainer);

    // Play/Pause buttons for each song
    const playPauseButton = document.createElement("button");
    playPauseButton.classList.add("btn", "btn-sm", "ml-3", "rounded-pill");
    playPauseButton.style.backgroundColor = "black";
    playPauseButton.style.color = "#f806cc";

    // login to change the icons
    const playPauseIcon = document.createElement("i");
    playPauseIcon.classList.add("fas", "fa-play");
    playPauseButton.appendChild(playPauseIcon);

    // Functionality for playing the song from the list
    playPauseButton.onclick = () => {
      currentSongIndex = index;
      loadSong(index);
      audioPlayer.play();
      updatePlayPauseIcon();
      updateSongListIcons();
    };

    li.appendChild(songInfo);
    li.appendChild(playPauseButton);

    songListElement.appendChild(li);
  });

  // After creating the song list, updates the play/pause icons
  updateSongListIcons();
}

// Function to update the play/pause icons in the song list according to the song playing
function updateSongListIcons() {
  const songItems = document.querySelectorAll(".song-item button i");

  songItems.forEach((icon, index) => {
    if (index === currentSongIndex && !audioPlayer.paused) {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    } else {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  });
}

// generates the song list after the oage is loaded
generateSongList();

// for playing the first song that loads initially
loadSong(currentSongIndex);
