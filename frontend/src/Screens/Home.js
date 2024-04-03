import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../SCSS/Home.scss";
import { context_music } from "../App";

export default function Home() {
    const Navigate = useNavigate();
    const { isAuthenticated, setIsAuthenticated, albums, setAlbums, setLikedSongs, set_currently_playing_music,
        musicPlayer, setmusicPlayer, allSongs, setAllSongs, notification, setNotification, setIsMusicClicked
    } = useContext(context_music);

    const [artistPlaylists, setArtistPlaylists] = useState([]);

    const getData = () => {
        fetch("http://localhost:3001/getBeatxData", {
            "method": "GET",
            "headers": {
                "content-type": "application/json"
            },
            withCredentials: true,
            credentials: 'include'
        })
            .then(data => data.json())
            .then((result) => {
                setArtistPlaylists(result.artistPlaylists);
                setAlbums(result.albums);
                setAllSongs(result.allSongs);
                setIsAuthenticated(result.isAuthenticated);
                setLikedSongs(result.likedSongs)
                set_currently_playing_music(result.lastPlayedMusic)
                setNotification(false);
                if (Object.keys(result.lastPlayedMusic).length > 0) {
                    console.log("true")
                    setmusicPlayer(true);
                }
                else {
                    console.log("false")
                    setmusicPlayer(false);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        getData();
    }, [])


    const rightSrl = () => {
        let element = document.querySelector("#artists");
        element.scrollLeft += element.offsetWidth;
    };

    const leftSrl = () => {
        let element = document.querySelector("#artists");
        element.scrollLeft -= element.offsetWidth;
    };

    const rightSrl2 = () => {
        let element = document.querySelector("#trendingSongs");
        element.scrollLeft += element.offsetWidth;
    };

    const leftSrl2 = () => {
        let element = document.querySelector("#trendingSongs");
        element.scrollLeft -= element.offsetWidth;
    };

    const logout = () => {
        fetch("http://localhost:3001/logout", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true,
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((data) => {
                getData();
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

    return (
        <div id="home"
            style={
                musicPlayer
                    ?
                    { height: "calc(100vh  - 70px)" }
                    :
                    { height: "100vh" }
            }
        >

            <div id="not_logged_in" style={notification ? { visibility: "visible" } : { visibility: "hidden" }}>
                <div id="not_logged_in_box" style={{ position: "relative" }}>
                    <div id="close_button" onClick={() => { setNotification(false) }}>X</div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Link to={"/login"} id="login_signup_btn" onclick="openLoginSignup()">Login/Signup</Link>
                    </div>
                </div>
            </div>

            <nav>
                <div>
                    <Link to={"/search"}>
                        <input
                            type="text"
                            className="searchbar"
                            placeholder="Search"
                            onMouseEnter={() => {
                                let searchbar = document.querySelector(".searchbar");
                                searchbar.style.border = "2px solid rgb(56, 221, 78)";
                            }}
                            onMouseLeave={() => {
                                let searchbar = document.querySelector(".searchbar");
                                searchbar.style.border = "2px solid white";
                            }}
                        />
                    </Link>
                </div>
                {
                    isAuthenticated
                        ?
                        <div className="profile" style={{ cursor: "pointer" }}>
                            <i
                                className="fa-solid fa-right-from-bracket"
                                style={{ color: "#ffffff", fontSize: "25px", padding: "10px" }}
                                onClick={logout}
                            ></i>
                        </div>
                        :
                        <Link to={"/Login"} className="profile">
                            <i
                                className="fa-solid fa-user"
                                style={{ color: "#ffffff", fontSize: "25px", padding: "10px" }}
                            ></i>
                        </Link>
                }

            </nav>
            <div id="popularArtists">
                <div id="popular">Popular Artists</div>
                <div id="sideScroll">
                    <div id="leftscroll" onClick={leftSrl}>
                        <i
                            className="fa-solid fa-angles-left"
                            style={{ color: "#ffffff", fontSize: "35px" }}
                        ></i>
                    </div>
                    <div id="artists">
                        {artistPlaylists.map((element, index) => {
                            return (
                                <Link to={`/artist/${element.playlist_name}`} style={{ textDecoration: "none" }} key={index}>
                                    <div style={{ cursor: "pointer" }}>
                                        <img src={element.playlist_image} alt={element.playlist_name} id="artist" />
                                        <p style={{ paddingTop: "5px" }}>{element.playlist_name}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div id="rightscroll" onClick={rightSrl}>
                        <i
                            className="fa-solid fa-angles-right"
                            style={{ color: "#ffffff", fontSize: "35px" }}
                        ></i>
                    </div>
                </div>
            </div>
            <div id="popularArtists">
                <div id="popular">Trending Songs</div>
                <div id="sideScroll">
                    <div id="leftscroll" onClick={leftSrl2}>
                        <i
                            className="fa-solid fa-angles-left"
                            style={{ color: "#ffffff", fontSize: "35px" }}
                        ></i>
                    </div>

                    {
                        isAuthenticated
                            ?
                            <div id="trendingSongs">
                                {allSongs.map((element, index) => {
                                    return (
                                        element.playlist.includes("Special")
                                            ?
                                            <div style={{ textDecoration: "none" }} key={index} onClick={() => { set_current_music(element) }}>
                                                <div style={{ cursor: "pointer" }}>
                                                    <img src={element.song_imagepath} alt={element.song_name} id="trending" />
                                                    <p style={{ paddingTop: "5px" }}>{element.song_name}</p>
                                                </div>
                                            </div>
                                            :
                                            <></>
                                    );
                                })}
                            </div>
                            :
                            <div id="trendingSongs">
                                {allSongs.map((element, index) => {
                                    return (
                                        element.playlist.includes("Special")
                                            ?
                                            <div style={{ textDecoration: "none" }} key={index} onClick={() => { setNotification(true) }}>
                                                <div style={{ cursor: "pointer" }}>
                                                    <img src={element.song_imagepath} alt={element.song_name} id="trending" />
                                                    <p style={{ paddingTop: "5px" }}>{element.song_name}</p>
                                                </div>
                                            </div>
                                            :
                                            <></>
                                    );
                                })}
                            </div>
                    }

                    <div id="rightscroll" onClick={rightSrl2}>
                        <i
                            className="fa-solid fa-angles-right"
                            style={{ color: "#ffffff", fontSize: "35px" }}
                        ></i>
                    </div>
                </div>
            </div>
            <div id="albums">
                <div id="popular">Popular Playlists</div>
                <div id="album_playlists">
                    {albums.map((element, index) => {
                        return (
                            <Link to={`/artist/${element.playlist_name}`} style={{ textDecoration: "none", cursor: "pointer" }} id="album_playlist" key={index}>
                                <img src={element.playlist_image} alt={element.playlist_name} id="playlist_image" />
                                <p style={{ paddingTop: "5px" }}>{element.playlist_name}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
