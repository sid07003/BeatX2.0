import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../SCSS/Artist.scss";
import { context_music } from "../App.js";

export default function PlaylistSongs() {
    const { playlistName } = useParams();
    const [songsData, setSongsData] = useState([]);
    const { isAuthenticated, likedSongs, setLikedSongs, set_currently_playing_music, musicPlayer,
        setIsMusicClicked, setmusicPlayer, notification, setNotification } = useContext(context_music);

    useEffect(() => {
        fetch("http://localhost:3001/getPlaylistSongs", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ "playlistName": playlistName }),
            withCredentials: true,
            credentials: 'include'
        })
            .then(data => data.json())
            .then((result) => {
                console.log(result.songs)
                setSongsData(result.songs);
            })
            .catch((err) => {
                console.log(err);
            })
    }, [playlistName])

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
                set_currently_playing_music(element);
                setIsMusicClicked(true);
                setmusicPlayer(true);
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
        <div id="Artist"
            style={
                musicPlayer
                    ?
                    { height: "calc(100vh  - 70px)" }
                    :
                    { height: "100vh" }
            }
        >
            {console.log(notification)}
            <div id="not_logged_in" style={notification ? { visibility: "visible" } : { visibility: "hidden" }}>
                <div id="not_logged_in_box" style={{ position: "relative" }}>
                    <div id="close_button" onClick={() => { setNotification(false) }}>X</div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Link to={"/login"} id="login_signup_btn" onclick="openLoginSignup()">Login/Signup</Link>
                    </div>
                </div>
            </div>

            <div id="info">
                <div id="container">
                    <img src={"../Images/playlist_icon.jpg"} alt={playlistName} id="singer" />
                </div>
                <div id="details">
                    <div id="Name">{playlistName}</div>
                    <div id="song_info">
                        <div>{songsData.length} Songs</div>
                    </div>
                    <div id="description3">
                        <div id="btn1">
                            <div><i className="fa-solid fa-play" style={{ color: "#ffffff", fontSize: "20px", paddingTop: "2px" }}></i></div>
                            <div style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}>Play</div>
                        </div>

                        <Link to={`/addSongs/${playlistName}`} style={{ textDecoration: "none" }}>
                            <div id="btn1" style={{ marginLeft: "10px" }}>
                                <div style={{ color: "white" }}>
                                    Add Songs
                                </div>
                            </div>
                        </Link>

                    </div>
                </div>
            </div>

            <div id="playlist">
                <div id="title">
                    <div id="blank"></div>
                    <div id="title_name">Name</div>
                    <div id="title_duration">Duration</div>
                    <div id="title_likes"></div>
                </div>

                <div id="body" style={{ width: "95%" }}>
                    {
                        songsData.length > 0
                            ?
                            songsData.map((element, index) => {
                                return (
                                    isAuthenticated
                                        ?
                                        <div
                                            id="songs"
                                        >
                                            <div id="blank" onClick={() => { set_current_music(element) }}>
                                                <img
                                                    src={element.song_imagepath}
                                                    alt={element.song_name}
                                                    style={{
                                                        height: "50px",
                                                        width: "50px",
                                                        borderRadius: "5px",
                                                    }}
                                                ></img>
                                            </div>

                                            <div
                                                id="body_name"
                                                onClick={() => { set_current_music(element) }}
                                            >
                                                <div>
                                                    {element.song_name}
                                                </div>
                                            </div>

                                            <div id="body_duration" onClick={() => { set_current_music(element) }}>{element.song_duration}</div>
                                            <div id="title_likes">
                                                {
                                                    likedSongs.includes(element._id)
                                                        ?
                                                        <i className="fa-solid fa-heart" style={{ color: "#ffffff" }} onClick={() => {
                                                            removeLike(element._id);
                                                        }}></i>
                                                        :
                                                        <i className="fa-regular fa-heart" style={{ color: "#ffffff" }} onClick={() => {
                                                            toggleLike(element._id);
                                                        }}></i>
                                                }
                                            </div>
                                        </div>
                                        :
                                        <div
                                            id="songs"
                                        >
                                            <div id="blank" onClick={() => { setNotification(true) }}>
                                                <img
                                                    src={element.song_imagepath}
                                                    alt={element.song_name}
                                                    style={{
                                                        height: "50px",
                                                        width: "50px",
                                                        borderRadius: "5px",
                                                    }}
                                                ></img>
                                            </div>

                                            <div
                                                id="body_name"
                                                onClick={() => { setNotification(true) }}
                                            >
                                                <div>
                                                    {element.song_name}
                                                </div>
                                            </div>

                                            <div id="body_duration" onClick={() => { setNotification(true) }}>{element.song_duration}</div>
                                            <div id="title_likes">
                                                <i className="fa-regular fa-heart" style={{ color: "#ffffff" }}></i>
                                            </div>
                                        </div>
                                );
                            })
                            :
                            <div style={{ textAlign: "center", color: "gray" }}>
                                <div style={{ paddingTop: "20px" }}>Currently No Song...</div>
                            </div>
                    }
                </div>
            </div>
        </div >
    );
}
