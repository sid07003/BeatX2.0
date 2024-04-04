import React, { useState, useContext, useEffect } from 'react'
import { useParams } from "react-router-dom";
import "../SCSS/Search.scss"
import { context_music } from "../App.js";


export default function AddSongs() {
    const [isNotification, setIsNotification] = useState(false);
    const [notification, setNotification] = useState("");
    const [isError, setIsError] = useState(false);
    const { playlistName } = useParams();
    const [isTyping, setIsTyping] = useState(false);
    const [isDataFound, setIsDataFound] = useState(true);
    const [searchedData, setSearchedData] = useState([]);
    const [allSongs,setAllSongs]=useState([]);
    const [cross, setCross] = useState(false);

    const {  musicPlayer } = useContext(context_music);

    useEffect(()=>{
        fetch("https://beat-x2-0.vercel.app/getAllSongs",{
            method:"GET",
            headers:{
                "content-type":"application/json"
            }
        })
        .then(res=>res.json())
        .then((data)=>{
            setAllSongs(data.allSongs);
        })
        .catch((err)=>{
            console.log(err);
        })
    })

    function read_substring(event) {
        setCross(true);
        const subString = event.target.value.toLowerCase().replace(/\s/g, '');
        const arr = [];
        if (subString.length === 0) {
            setIsTyping(false)
        } else {
            allSongs.forEach((element) => {
                const songName = element.song_name.toLowerCase().replace(/\s/g, '');
                if (songName.includes(subString)) {
                    arr.push(element._id);
                    console.log(element._id)
                }
            })
            setIsTyping(true);
            setIsDataFound(arr.length > 0);
        }
        setSearchedData([...arr]);
    }

    const addSong = (songId) => {
        fetch("https://beat-x2-0.vercel.app/addSong", {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({ songId: songId, playlistName: playlistName }),
            credentials: "include"
        })
            .then((res) => {
                if (!res.ok) {
                    if (res.status === 400) {
                        alert("song already present");
                    }
                    else {
                        console.log("Internal server error");
                    }
                }
                else {
                    setNotification("song added");
                    setIsNotification(true);
                    setTimeout(() => {
                        setIsNotification(false);
                    }, 2000);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    function backToSearch() {
        let searchbar = document.querySelector("#search_bar");
        searchbar.value = "";
        setIsTyping(false);
        setCross(false);
    }


    return (
        <div id="search"
            style={musicPlayer
                ?
                { height: "calc(100vh  - 70px)" }
                :
                { height: "100vh" }
            }>
            <div id="notification" className={isNotification ? (isError ? "error" : "success") : "noError"} style={{left:"800px"}}>
                {notification}
            </div>
            <div id="search_div" style={{ position: "relative" }}>
                <div>
                    <input
                        type="text"
                        className="searchbar"
                        placeholder="Search"
                        onChange={read_substring}
                        id="search_bar"
                        style={{ color: "white", paddingRight: "40px" }}
                    />
                    <div id="cross" style={cross ? { visibility: "visible" } : { visibility: "hidden" }} onClick={backToSearch}>
                        X
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "left", alignItems: "center", height: "50px", width: "92%", PaddingTop: "0px" }}>
                <div style={{ fontSize: "25px", color: "white" }}>
                    Recent Searches
                </div>
            </div>
            <div id="playlist1">
                <div id="title">
                    <div id="blank"></div>
                    <div id="title_name">Name</div>
                    <div id="title_duration">Duration</div>
                    <div id="title_likes"></div>
                </div>
                {console.log(allSongs)}
                {
                    isTyping
                        ?
                        isDataFound
                            ?
                            allSongs.map((element) => {
                                return searchedData.includes(element._id)
                                    ?
                                    (<div
                                        id="songs"
                                    >
                                        <div id="blank" onClick={() => { addSong(element._id) }}>
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
                                            onClick={() => { addSong(element._id) }}
                                        >
                                            <div>
                                                {element.song_name}
                                            </div>
                                        </div>

                                        <div id="body_duration" onClick={() => { addSong(element._id) }}>{element.song_duration}</div>
                                    </div>)
                                    :
                                    (<></>)
                            })
                            :
                            <div id="corrections">No Data Found</div>
                        :
                        allSongs.map((element) => {
                            return (
                                <div
                                    id="songs"
                                >
                                    <div id="blank" onClick={() => { addSong(element._id) }}>
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
                                        onClick={() => { addSong(element._id) }}
                                    >
                                        <div>
                                            {element.song_name}
                                        </div>
                                    </div>

                                    <div id="body_duration" onClick={() => { addSong(element._id) }}>{element.song_duration}</div>
                                </div>
                            )
                        })
                }
            </div>
        </div>
    )
}