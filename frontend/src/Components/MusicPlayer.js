import React, { useContext, useEffect, useState } from "react";
import { context_music } from "../App.js";
import "../SCSS/MusicPlayer.scss";

export default function MusicPlayer() {
    const { likedSongs, setLikedSongs, currently_playing_music, set_currently_playing_music, musicPlayer,
        isMusicPlaying, setIsMusicPlaying, isMusicClicked, setIsMusicClicked } = useContext(context_music);

    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(50); // Initial volume set to 50

    const toggleLike = (songId) => {
        fetch("http://localhost:3001/addLikeSong", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ "songId": songId }),
            withCredentials: true,
            credentials: 'include'
        })
            .then(res => res.json())
            .then((result) => {
                console.log("Successfully added to liked Songs")
                setLikedSongs([...likedSongs, songId]);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const playMusic = () => {
        const music = document.getElementById('music');
        music.play();
        setIsMusicPlaying(true);
    }

    const pauseMusic = () => {
        const music = document.getElementById('music');
        music.pause();
        setIsMusicPlaying(false);
    }

    const handleTimeUpdate = () => {
        const music = document.getElementById('music');
        setCurrentTime(music.currentTime);
    }

    const handleSeeking = (e) => {
        if (e.type === 'click') {
            const music = document.getElementById('music');
            const progress = parseFloat(e.nativeEvent.offsetX) / parseFloat(e.currentTarget.offsetWidth);
            const durationInSeconds = parseDurationToSeconds(currently_playing_music.song_duration);
            setCurrentTime(progress * durationInSeconds);
            music.currentTime = progress * durationInSeconds;
        }
    }

    // Function to parse "MM:SS" format to seconds
    const parseDurationToSeconds = (duration) => {
        const [minutes, seconds] = duration.split(":").map(parseFloat);
        return minutes * 60 + seconds;
    }

    useEffect(() => {
        const music = document.getElementById('music');
        music.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            music.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    useEffect(() => {
        setIsMusicClicked(false);
        if (isMusicClicked) {
            playMusic();
        }
    }, [isMusicClicked])

    const convert_current_time = (currentTime) => {
        const minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        const duration = `${minutes}:${seconds}`;
        return duration;
    }

    const handleVolumeChange = (e) => {
        const music = document.getElementById('music');
        const volumeLevel = parseFloat(e.target.value) / 100;
        setVolume(e.target.value);
        music.volume = volumeLevel;
    }

    const set_current_music = (element) => {
        fetch("http://localhost:3001/setCurrentlyPlayingMusic", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ "song": element }),
            withCredentials: true,
            credentials: 'include'
        })
            .then(res => res.json())
            .then((result) => {
                console.log("current song updated");
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const nextSong = (song) => {
        fetch("http://localhost:3001/nextSong", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ "song": song })
        })
            .then(res => res.json())
            .then((result) => {
                set_currently_playing_music(result.nextSong);
                set_current_music(result.nextSong);
                setIsMusicClicked(true);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const prevSong = (song) => {
        fetch("http://localhost:3001/prevSong", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ "song": song })
        })
            .then(res => res.json())
            .then((result) => {
                set_currently_playing_music(result.prevSong);
                set_current_music(result.prevSong);
                setIsMusicClicked(true);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const removeLike = (songId) => {
        fetch("http://localhost:3001/removeLikeSong", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ "songId": songId }),
            withCredentials: true,
            credentials: 'include'
        })
            .then(res => res.json())
            .then((result) => {
                console.log("Successfully added to liked Songs")
                const updatedLikedSongs = likedSongs.filter(id => id !== songId);
                setLikedSongs([...updatedLikedSongs]);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <div
            id="music_player"
            style={
                musicPlayer
                    ? { visibility: "visible" }
                    : { visibility: "hidden" }
            }
        >
            <audio
                controls
                src={currently_playing_music.song_audiopath}
                type="audio/mp3"
                id="music"
            ></audio>
            <div id="left_part">
                <div>
                    <img src={currently_playing_music.song_imagepath} alt={currently_playing_music.song_name}></img>
                </div>
                <div style={{ color: "white", overflow: "hidden", width: "200px", height: "55px" }}>

                    <p style={{ height: "30px", fontSize: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
                        {currently_playing_music.song_name}
                    </p>


                    <p style={{ opacity: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "-20px", textAlign: "left" }}>
                        {currently_playing_music.song_artists.join(', ')}
                    </p>

                </div>
                <div id="likes" style={{ cursor: "pointer" }}>
                    {
                        likedSongs.includes(currently_playing_music._id)
                            ?
                            <i className="fa-solid fa-heart" style={{ color: "#ffffff" }} onClick={() => {
                                removeLike(currently_playing_music._id);
                            }}></i>
                            :
                            <i className="fa-regular fa-heart" style={{ color: "#ffffff" }} onClick={() => {
                                toggleLike(currently_playing_music._id);
                            }}></i>
                    }
                </div>
            </div>
            <div id="current_time">{convert_current_time(currentTime)}</div>
            <div id="middle_part">
                <div id="music_controllers">
                    <div  onClick={() => { prevSong(currently_playing_music) }}>
                        <i
                            className="fa-solid fa-backward"
                            style={{ color: "#ffffff", cursor: "pointer" }}
                        ></i>
                    </div>
                    <div>
                        {
                            !isMusicPlaying
                                ?
                                <i className="fa-solid fa-play"
                                    style={{ color: "#ffffff", cursor: "pointer" }}
                                    onClick={playMusic}
                                ></i>
                                :
                                <i className="fa-solid fa-pause"
                                    style={{ color: "#ffffff", cursor: "pointer" }}
                                    onClick={pauseMusic}
                                ></i>
                        }
                    </div>
                    <div onClick={() => { nextSong(currently_playing_music) }}>
                        <i className="fa-solid fa-forward" style={{ color: "#ffffff", cursor: "pointer" }}></i>
                    </div>
                </div>

                <div id="music_progress" style={{ width: "70%", backgroundColor: "gray", height: "5px", cursor: "pointer" }} onClick={handleSeeking}>
                    <div style={{ width: `${(currentTime / parseDurationToSeconds(currently_playing_music.song_duration)) * 100}%`, height: "100%", backgroundColor: "blue", borderRadius: "10px" }}></div>
                </div>
            </div>
            <div id="duration">{currently_playing_music.song_duration}</div>
            <div>
                <div id="sound_controller">
                    <div>
                        <i
                            className="fa-solid fa-volume-high"
                            style={{ color: "#ffffff", cursor: "pointer" }}
                        ></i>
                    </div>
                    <div style={{ marginTop: "2px" }}>
                        <input
                            type="range"
                            max="100"
                            style={{ width: "100px", cursor: "pointer" }}
                            id="sound_progress"
                            value={volume}
                            onChange={handleVolumeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
