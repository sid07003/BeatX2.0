require('dotenv').config({ path: './.env' });
const port = process.env.PORT || 8080
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

let dbinstance;

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin:"https://beat-x2-0-a8io.vercel.app",
    methods:["GET","POST"],
    credentials:true
}));

app.use(cookieParser());

const { MongoClient, ObjectId } = require('mongodb');
MongoClient.connect("mongodb+srv://SiddharthSharma:siddharth@cluster0.gacgrpw.mongodb.net/")
    .then((client) => {
        dbinstance = client.db("beatx");
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });

// --------------------------------- Token Verification middleware --------------------------------------

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        console.log("unauthorized")
        return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.userId = new ObjectId(decoded.id);
        next();
    });
};


// ---------------------------------- Authentication End Points ------------------------------------------
app.post("/login", async (req, res) => {
    console.log("helo")
    try {
        const loginData = req.body;

        const result = await dbinstance.collection("user_data").findOne({ email: loginData.email });

        if (!result) {
            console.log("reached2")
            return res.status(400).json({ error: "User Not found" });
        }

        bcrypt.compare(loginData.password, result.password, (err, response) => {
            if (err || !response) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const accessToken = jwt.sign({ id: result._id, email: result.email }, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 * 1000 });

            res.cookie("access_token", accessToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: "/"
            });
            console.log("done")
            res.status(200).json({ success: true });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("access_token", { path: "/" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
})

app.post("/signup", (req, res) => {
    const user = req.body;

    if (user.password !== user.confirmPassword) {
        console.log("hello");
        res.status(400).json({ error: "passwords not matching" });
    }
    else {
        bcrypt.hash(user.password, 2, (err, hash) => {
            const userInfo = {
                "email": user.email,
                "password": hash,
                "likedSongs": [],
                "lastPlayedMusic": {},
                "playlists": []
            }

            dbinstance.collection("user_data").insertOne(userInfo)
                .then((result) => {
                    res.status(200).json({ "message": "User created successfully" });
                })
                .catch((err) => {
                    res.status(500).json({ error: "Internal Server Error" });
                })
        })
    }
})

// ------------------------------------------ retrieve beatx data -------------------------------------
app.get("/getBeatxData", (req, res) => {
    const token = req.cookies.access_token;
    console.log(token);

    let isAuthenticated = false;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                isAuthenticated = true;
                const userId = new ObjectId(decoded.id);
                dbinstance.collection("user_data").findOne({ _id: userId })
                    .then((result) => {
                        fetchBeatxData(isAuthenticated, res, result);
                    })
                    .catch((err) => {
                        console.log("here we go");
                        res.status(500).json({ error: "An error occurred while fetching data" });
                    });
            } else {
                console.log(err);
                fetchBeatxData(isAuthenticated, res);
            }
        });
    } else {
        console.log("else");
        fetchBeatxData(isAuthenticated, res);
    }
});

function fetchBeatxData(isAuthenticated, res, userData = {}, lastPlayedMusic = {}) {
    dbinstance.collection("beatx_playlists_data").find().toArray()
        .then((data) => {
            const artistPlaylists = data[0].playlist;
            const albums = data[1].playlist;

            dbinstance.collection("songs_data").find().toArray()
                .then((specialSongs) => {
                    res.status(200).json({
                        artistPlaylists: artistPlaylists,
                        albums: albums,
                        allSongs: specialSongs,
                        isAuthenticated: isAuthenticated,
                        likedSongs: isAuthenticated ? userData.likedSongs || [] : [],
                        lastPlayedMusic: isAuthenticated ? userData.lastPlayedMusic || {} : {},
                    });
                })
                .catch((err) => {
                    console.log("Error fetching special songs:", err);
                    res.status(500).json({ error: "An error occurred while fetching special songs" });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: "An error occurred while fetching data" });
        });
}


// ----------------------------------------- retrieve artist data ----------------------------------------------- 
app.post("/getArtistData", (req, res) => {
    dbinstance.collection("beatx_playlists_data").findOne({ "playlist.playlist_name": req.body.playlistName }, { "playlist.$": 1 })
        .then((data) => {
            const reqData = data.playlist.find(playlist => playlist.playlist_name === req.body.playlistName);
            dbinstance.collection("songs_data").find({ playlist: req.body.playlistName }).toArray()
                .then((result) => {
                    res.status(200).json({ songs: result, playlistData: reqData });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: "Internal Server Error" });
                })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error" });
        })
})

// --------------------------------------- Handling songs like/unlike ---------------------------
app.post("/addLikeSong", verifyToken, (req, res) => {
    const songId = new ObjectId(req.body.songId);
    const userId = req.userId;

    dbinstance.collection("user_data").updateOne(
        { _id: userId },
        { $addToSet: { likedSongs: songId } },
    )
        .then(() => {
            res.status(200).json({ success: true });
        })
        .catch(() => {
            res.status(500).json({ error: "Internal Server Error" });
        });
});

app.post("/removeLikeSong", verifyToken, (req, res) => {
    const songId = new ObjectId(req.body.songId);
    const userId = req.userId;

    dbinstance.collection("user_data").updateOne(
        { _id: userId },
        { $pull: { likedSongs: songId } },
    )
        .then(() => {
            res.status(200).json({ success: true });
        })
        .catch(() => {
            res.status(500).json({ error: "Internal Server Error" });
        });
})

// -------------------------------------- set currently palying music -------------------------------
app.post("/setCurrentlyPlayingMusic", verifyToken, (req, res) => {
    const song = req.body.song;
    const userId = new ObjectId(req.userId);

    dbinstance.collection("user_data").updateOne(
        { _id: userId },
        { $set: { lastPlayedMusic: song } }
    )
        .then(result => {
            res.status(200).json({ success: true, message: "Currently playing music set successfully" });
        })
        .catch(error => {
            console.error("Error setting currently playing music:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

// ---------------------------------------------- Next Song --------------------------------------------

app.post("/nextSong", (req, res) => {
    const song = req.body.song;
    let nextIndex = song.index + 1;
    dbinstance.collection("songs_data").findOne({ index: nextIndex })
        .then((data) => {
            if (!data) {
                dbinstance.collection("songs_data").findOne({ index: 0 })
                    .then((result) => {
                        res.status(200).json({ nextSong: result });
                    })
                    .catch((err) => {
                        res.status(500).json({ error: "Internal Server Error" });
                    })
            }
            else {
                res.status(200).json({ nextSong: data });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal Server Error" });
        })
})

// ------------------------------------------------- prevous song -----------------------------

app.post("/prevSong", (req, res) => {
    const song = req.body.song;
    let prevIndex = song.index - 1;
    dbinstance.collection("songs_data").findOne({ index: prevIndex })
        .then((data) => {
            if (!data) {
                dbinstance.collection("songs_data").find({}).toArray()
                    .then((response) => {
                        dbinstance.collection("songs_data").findOne({ index: response.length - 1 })
                            .then((result) => {
                                res.status(200).json({ prevSong: result });
                            })
                            .catch((err) => {
                                res.status(500).json({ error: "Internal Server Error" });
                            })
                    })
                    .catch((err) => {
                        res.status(500).json({ error: "Internal Server Error" });
                    })
            }
            else {
                res.status(200).json({ prevSong: data });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal Server Error" });
        })
})

// --------------------------------------- Retrieving Liked Songs -----------------------------------

app.post("/getLikedSongs", verifyToken, (req, res) => {
    const userId = new ObjectId(req.userId);

    dbinstance.collection("user_data").findOne({ _id: userId })
        .then((result) => {
            const likedSongs = result.likedSongs;
            console.log(likedSongs)

            dbinstance.collection("songs_data").find({ _id: { $in: likedSongs } })
                .toArray()
                .then((songs) => {
                    res.json({ likedSongs: songs });
                })
                .catch((err) => {
                    console.error("Error finding songs:", err);
                    res.status(500).json({ error: "Internal server error" });
                });
        })
        .catch((err) => {
            console.error("Error finding user data:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});

// ---------------------------------------- get albums data --------------------------------------

app.get("/getAlbumData", (req, res) => {
    dbinstance.collection("beatx_playlists_data").find().toArray()
        .then((data) => {
            const albums = data[1].playlist;
            res.status(200).json({ albums: albums })
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal server error" })
        })
})

app.post("/setCurrentlyPlayingMusic_and_recentlysearched", verifyToken, (req, res) => {
    const song = req.body.song;
    const userId = new ObjectId(req.userId);

    dbinstance.collection("user_data").updateOne(
        { _id: userId },
        {
            $set: { lastPlayedMusic: song },
            $push: { recentlySearchedSongs: song._id }
        }
    )
        .then(result => {
            res.status(200).json({ success: true, message: "Currently playing music set successfully" });
        })
        .catch(error => {
            console.error("Error setting currently playing music:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
})

app.post("/addPlaylist", verifyToken, (req, res) => {
    const userId = req.userId;
    const playlist = req.body.playlist;

    dbinstance.collection("user_data").findOne({
        _id: userId,
        "playlists.playlistName": playlist.playlistName
    })
        .then(existingPlaylist => {
            if (existingPlaylist) {
                res.status(404).json({ error: "Playlist with the same name already exists" });
            } else {
                dbinstance.collection("user_data").updateOne(
                    { _id: userId },
                    { $push: { playlists: playlist } }
                )
                    .then(result => {
                        if (result.modifiedCount === 1) {
                            res.status(200).json({ message: "Playlist added successfully" });
                        } else {
                            res.status(404).json({ error: "User not found" });
                        }
                    })
                    .catch(err => {
                        console.error("Error adding playlist:", err);
                        res.status(500).json({ error: "Error adding playlist" });
                    });
            }
        })
        .catch(err => {
            console.error("Error checking existing playlist:", err);
            res.status(500).json({ error: "Error checking existing playlist" });
        });
})


app.get("/getPlaylist", verifyToken, (req, res) => {
    const userId = req.userId;

    dbinstance.collection("user_data").findOne(
        { _id: userId }
    )
        .then(user => {
            res.status(200).json({ playlistsData: user.playlists });
        })
        .catch(err => {
            console.error("Error fetching playlists:", err);
            res.status(500).json({ error: "Error fetching playlists" });
        });
});

app.post("/removePlaylist", verifyToken, (req, res) => {
    const userId = req.userId;
    const playlistName = req.body.playlistName;

    dbinstance.collection("user_data").updateOne(
        { _id: userId },
        { $pull: { playlists: { playlistName: playlistName } } } // Using $pull to remove the playlist
    )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.status(200).json({ message: "Playlist removed successfully" });
            } else {
                res.status(404).json({ error: "Playlist not found for the user" });
            }
        })
        .catch(err => {
            console.error("Error removing playlist:", err);
            res.status(500).json({ error: "Error removing playlist" });
        });
})

app.post("/getPlaylistSongs", verifyToken, (req, res) => {
    const userId = req.userId;
    const playlistName = req.body.playlistName;

    dbinstance.collection("user_data").findOne({ _id: userId })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const playlist = user.playlists.find(p => p.playlistName === playlistName);

            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }

            const songIds = playlist.songs.map(song => new ObjectId(song));

            dbinstance.collection("songs_data").aggregate([
                { $match: { _id: { $in: songIds } } }
            ]).toArray()
                .then(songs => {
                    res.status(200).json({ songs:songs });
                })
                .catch(err => {
                    console.error("Error fetching songs:", err);
                    res.status(500).json({ error: "Error fetching songs" });
                });
        })
        .catch(err => {
            console.error("Error finding user:", err);
            res.status(500).json({ error: "Error finding user" });
        });
});

app.get("/SearchedSongs",verifyToken,(req,res)=>{
    const userId=req.userId;

    dbinstance.collection("user_data").findOne({_id:userId})
    .then((data)=>{
        res.status(200).json({searchedSongs:data.recentlySearchedSongs});
    })
    .catch((err)=>{
        res.status(500).json({err:"Internal Server Error"});
    })
})

app.post("/addSong", verifyToken, (req, res) => {
    const userId = req.userId;
    const songId = req.body.songId;
    const playlistName = req.body.playlistName;

    dbinstance.collection("user_data").findOne(
        { 
            _id: userId,
            "playlists.playlistName": playlistName,
            "playlists.songs": songId
        }
    )
    .then(existingSong => {
        if (existingSong) {
            res.status(400).json({ error: "Song already exists in the playlist" });
        } else {
            dbinstance.collection("user_data").updateOne(
                { 
                    _id: userId,
                    "playlists.playlistName": playlistName
                },
                { 
                    $push: { "playlists.$.songs": songId }
                }
            )
            .then(result => {
                if (result.modifiedCount === 1) {
                    res.status(200).json({ message: "Song added to playlist successfully" });
                } else {
                    res.status(404).json({ error: "User or playlist not found" });
                }
            })
            .catch(err => {
                console.error("Error adding song to playlist:", err);
                res.status(500).json({ error: "Error adding song to playlist" });
            });
        }
    })
    .catch(err => {
        console.error("Error checking existing song in playlist:", err);
        res.status(500).json({ error: "Error checking existing song in playlist" });
    });
});

app.get("/getAllSongs",(req,res)=>{
    dbinstance.collection("songs_data").find({}).toArray()
    .then((data)=>{
        res.status(200).json({allSongs:data})
    })
    .catch((err)=>{
        console.log(err);
    })
})

app.get("/",(req,res)=>{
    res.send("Welcome to beatx server");
})

// --------------------------------------------------------------------------------------------------

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server Activated")
    }
})
