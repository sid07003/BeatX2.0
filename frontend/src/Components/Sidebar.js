import React, { useContext, useEffect, useState } from "react";
import "../SCSS/Sidebar.scss";
import { context_music } from "../App";
import { Link } from "react-router-dom";

export default function Sidebar() {
    const { isAuthenticated, setNotification } = useContext(context_music);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        fetch("https://beat-x2-0.vercel.app//getAlbumData", {
            "method": "GET",
            "headers": {
                "content-type": "application/json"
            }
        })
            .then(res => res.json())
            .then((result) => {
                setAlbums(result.albums);
            })
            .catch((err) => {
                console.log(err);
            })
    })
    return (
        <div className="sidebar">
            <div className="logo">
                <div style={{ margin: "5px" }}>
                    <i className="fa-solid fa-music" style={{ color: "#ffffff", fontSize: "35px" }} id="beatxLogo"></i>
                </div>
                <div className="homeText" style={{ color: "#ffffff", fontSize: "25px" }}><b><i>BEATX</i></b></div>
            </div>
            <Link to={"/"} className="home">
                <div style={{ margin: "10px" }}>
                    <i className="fa-solid fa-house" style={{ color: "#ffffff" }}></i>
                </div>
                <div className="homeText">Home</div>
            </Link>
            {
                isAuthenticated
                    ?
                    <Link to={"/search"} className="search" >
                        <div style={{ margin: "10px" }}>
                            <i
                                className="fa-solid fa-magnifying-glass"
                                style={{ color: "#ffffff" }}
                            ></i>
                        </div>
                        <div style={{ margin: "5px", color: "white" }}>Search</div>
                    </Link>
                    :
                    <div className="search" onClick={() => { setNotification(true) }}>
                        <div style={{ margin: "10px" }}>
                            <i
                                className="fa-solid fa-magnifying-glass"
                                style={{ color: "#ffffff" }}
                            ></i>
                        </div>
                        <div style={{ margin: "5px", color: "white" }}>Search</div>
                    </div>
            }
            <div className="library">
                <div className="heading">
                    <div style={{ margin: "5px" }}>
                        <i className="fa-solid fa-bars" style={{ color: "#ffffff" }}></i>
                    </div>
                    <div style={{ margin: "10px" }}>Library</div>
                </div>
                {/* --------------------------------------------------------------------------------------- */}
                {
                    isAuthenticated
                        ?
                        <ul className="content">
                            <Link to={"/likedsongs"} style={{ textDecoration: "none" }}>
                                <li className="liked">
                                    <div style={{ margin: "5px" }} >
                                        <i className="fa-solid fa-heart" style={{ color: "#ffffff" }}></i>
                                    </div>
                                    <div style={{ margin: "5px" }} >Liked Songs</div>
                                </li>
                            </Link>
                            {/* --------------------------------------------------------------------------------------- */}
                            <Link to={"/myplaylist"} style={{ textDecoration: "none" }} className="liked">
                                <div style={{ margin: "5px" }} >
                                    <i className="fa-solid fa-bars" style={{ color: "#ffffff" }}></i>
                                </div>
                                <div
                                    style={{
                                        margin: "5px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        color:"white"
                                    }}
                                >
                                    My Playlists
                                </div>
                            </Link>
                            {albums.map((item, index) => (
                                <li className="liked" key={index}>
                                    <Link to={`/artist/${item.playlist_name}`}
                                        style={{
                                            margin: "5px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: "rgb(255, 255, 255, 0.7)",
                                            textDecoration: "none"
                                        }}
                                    >
                                        {item.playlist_name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        :
                        <ul className="content">
                            <li className="liked" onClick={() => { setNotification(true) }}>
                                <div style={{ margin: "5px" }} >
                                    <i className="fa-solid fa-heart" style={{ color: "#ffffff" }}></i>
                                </div>
                                <div style={{ margin: "5px" }} >Liked Songs</div>
                            </li>
                            {/* --------------------------------------------------------------------------------------- */}
                            <li className="liked" onClick={() => { setNotification(true) }}>
                                <div style={{ margin: "5px" }} >
                                    <i className="fa-solid fa-bars" style={{ color: "#ffffff" }}></i>
                                </div>
                                <div
                                    style={{
                                        margin: "5px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    My Playlists
                                </div>
                            </li>
                            {albums.map((item, index) => (
                                <li className="liked" key={index} onClick={() => { setNotification(true) }}>
                                    <div
                                        style={{
                                            margin: "5px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: "rgb(255, 255, 255, 0.7)",
                                            textDecoration: "none"
                                        }}
                                    >
                                        {item.playlist_name}
                                    </div>
                                </li>
                            ))}
                        </ul>
                }
            </div>
        </div>
    );
}
