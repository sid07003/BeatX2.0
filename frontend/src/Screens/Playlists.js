import React, { useState, useEffect, useContext } from 'react'
import "../SCSS/Playlists.scss";
import { context_music } from "../App.js";
import { Link } from 'react-router-dom';

export default function Playlists() {
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
    const [playlistData, setPlaylistData] = useState([]);
    const { musicPlayer } = useContext(context_music);

    useEffect(() => {
        getPlaylists();
    }, []);

    const addPlaylist = () => {
        setIsCreatingPlaylist(false);
        let playlistName = document.getElementById("create_playlist_form_input").value;
        document.getElementById("create_playlist_form_input").value = "";

        const obj = {
            playlistName: playlistName,
            songs: []
        }

        fetch("https://beat-x2-0.vercel.app//addPlaylist", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ playlist: obj }),
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    alert("Playlist with the same name already exists");
                } else {
                    alert("Error adding playlist");
                }
            }
            else{
                getPlaylists();
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    const getPlaylists = () => {
        fetch("https://beat-x2-0.vercel.app//getPlaylist", {
            method: "GET",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setPlaylistData(data.playlistsData);
            })
            .catch(err => {
                console.error(err);
            });
    }

    const remove_playlist = (playlistName) => {
        fetch("https://beat-x2-0.vercel.app//removePlaylist", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ playlistName: playlistName }),
            credentials: "include"
        })
            .then(() => {
                getPlaylists();
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <div id="myplaylist"
            style={
                musicPlayer
                    ?
                    { height: "calc(100vh  - 70px)" }
                    :
                    { height: "100vh" }
            }
        >

            <div id="create_playlist_area" style={isCreatingPlaylist ? { visibility: "visible" } : { visibility: "hidden" }}>
                <div id="create_playlist">
                    <div id="create_playlist_heading_area">
                        <div id="create_playlist_heading">Create New Playlist</div>
                        <div id="create_playlist_heading_close" onClick={() => { setIsCreatingPlaylist(false) }}>X</div>
                    </div>
                    <form id="create_playlist_form">
                        <div id="create_playlist_form_heading">Playlist Name</div>
                        <input type="text" placeholder="Enter The Name" name="playlist_name" id="create_playlist_form_input" />
                    </form>
                    <div id="create_playlist_form_create" onClick={() => { addPlaylist() }} style={{ paddingTop: "10px" }}>
                        Create Playlist
                    </div>
                </div>
            </div>

            <div id="liked_heading">
                <div id="liked_heading_content">
                    <img
                        src={"../Images/playlist_icon.jpg"}
                        alt="Header Song"
                        id="header_image"
                    />
                </div>
                <div id="liked_heading_content_right">
                    <div id="description1">All Playlists</div>
                    <div id="description2">{playlistData.length} Playlists</div>
                    <div id="description3">
                        <div id="btn1" onClick={() => { setIsCreatingPlaylist(true) }}>
                            <div><i className="fa-solid fa-plus" style={{ color: "#ffffff", fontSize: "20px", paddingTop: "2px" }}></i></div>
                            <div style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}>Create New Playlist</div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="playlist_area">
                <div id="title">
                    <div id="blank"></div>
                    <div id="playlist_name">Name</div>
                    <div id="playlist_length">Length</div>
                    <div id="add_to_playlist"></div>
                </div>
                <div id="body" style={{ width: "95%" }}>
                    {
                        playlistData.length > 0 ?
                            playlistData.map((element, index) => (
                                <div key={index} id="playlists">
                                    <Link to={`/playlist/${element.playlistName}`} id="blank" style={{ textDecoration: "none" }}>
                                        <img src={"../Images/playlist_icon.jpg"} style={{ height: "50px", width: "50px", borderRadius: "10px" }} alt="playlist-icon" />
                                    </Link>
                                    <Link to={`/playlist/${element.playlistName}`} id="body_name" style={{ textDecoration: "none" }}>
                                        {element.playlistName}
                                    </Link>
                                    <Link to={`/playlist/${element.playlistName}`} id="body_length" style={{ textDecoration: "none" }}>
                                        5 songs
                                    </Link>
                                    <div id="add_to_playlist" onClick={() => { remove_playlist(element.playlistName) }}>
                                        <div id="remove_playlist_btn">
                                            Remove Playlist
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            <div style={{ textAlign: "center", color: "gray" }}>
                                <div style={{ paddingTop: "20px" }}>Currently No Playlist...</div>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}