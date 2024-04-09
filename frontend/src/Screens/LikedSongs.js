import React, { useContext, useEffect, useState } from "react";
import { context_music } from "../App.js";

export default function LikedSongs() {
    const { likedSongs, setLikedSongs, set_currently_playing_music, musicPlayer,
        setIsMusicClicked, setmusicPlayer, allSongs } = useContext(context_music);

    const likedSongsData = allSongs.filter(song => likedSongs.includes(song._id));

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
            <div id="info">
                <div id="container">
                    <img src="../images/heartImage.jpeg" alt="heartImage" id="singer" />
                </div>
                <div id="details">
                    <div id="Name">LikedSongs</div>
                    <div id="song_info">
                        <div>{likedSongsData.length} Songs</div>
                    </div>
                    <div id="play_all">
                        <div>
                            <i className="fa-solid fa-play"></i>
                        </div>
                        <div style={{ paddingLeft: "8px" }}>Play All</div>
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
                        likedSongs.length > 0
                            ?
                            likedSongsData.map((element, index) => {
                                return (
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
                                            <i className="fa-solid fa-heart" style={{ color: "#ffffff" }}
                                                onClick={() => {
                                                    removeLike(element._id);
                                                }}
                                            ></i>
                                        </div>
                                    </div>
                                );
                            })
                            :
                            <div style={{ textAlign: "center", color: "gray" }}>
                                <div style={{paddingTop:"20px"}}>Currently No Liked Songs...</div>
                            </div>
                    }
                </div>
            </div>
        </div >
    )
}
