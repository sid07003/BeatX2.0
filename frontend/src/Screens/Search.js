import React, { useState, useContext, useEffect } from 'react'
import "../SCSS/Search.scss"
import { context_music } from "../App.js";


export default function Search(props) {
    const [recentlySearchedSongs, setRecentlySearchedSongs] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSearchEmpty, setIsSearchEmpty] = useState(true);
    const [isDataFound, setIsDataFound] = useState(true);
    const [searchedData, setSearchedData] = useState([]);
    const [cross, setCross] = useState(false);

    const { allSongs, likedSongs, setLikedSongs, set_currently_playing_music, musicPlayer,
        setIsMusicClicked, setmusicPlayer } = useContext(context_music);

    useEffect(() => {
        fetch("http://localhost:3001/SearchedSongs", {
            "method": "GET",
            "headers": {
                "content-type": "application/json"
            },
            withCredentials: true,
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                setRecentlySearchedSongs(data.searchedSongs);
                if (data.searchedSongs.length === 0) {
                    setIsSearchEmpty(true);
                }
                else {
                    setIsSearchEmpty(false);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }, [recentlySearchedSongs])

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

    const set_current_music = (element) => {
        fetch("http://localhost:3001/setCurrentlyPlayingMusic_and_recentlysearched", {
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
                    <div id="cross" style={cross? {visibility:"visible"}:{visibility:"hidden"}} onClick={backToSearch}>
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
                                        
                                    </div>)
                                    :
                                    (<></>)
                            })
                            :
                            <div id="corrections">No Data Found</div>
                        :
                        isSearchEmpty
                            ?
                            <div id="corrections">No Data Found</div>
                            :
                            allSongs.map((element) => {
                                return recentlySearchedSongs.includes(element._id)
                                    ?
                                    (<div
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
                                        
                                    </div>)
                                    :
                                    (<></>)
                            })

                }
            </div>
        </div>
    )
}