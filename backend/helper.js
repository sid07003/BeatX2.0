// const fs = require('fs');
// const { promisify } = require('util');
// const mm = require('music-metadata');

// const readdir = promisify(fs.readdir);
// const stat = promisify(fs.stat);

// // Directory containing the songs
// const songsDir = 'f:/Important project/beatx/public/songs';

// async function songInfo(filePath,filename) {
//     try {
//         const metadata = await mm.parseFile(filePath);
//         const minutes = Math.floor(metadata.format.duration / 60);
//         let seconds = Math.floor(metadata.format.duration % 60);
//         if (seconds < 10) {
//             seconds = "0" + seconds;
//         }
//         const duration = `${minutes}:${seconds}`;

//         // Construct image path by replacing .mp3 with .jpeg
//         const imagePath = filePath.replace('.mp3', '.jpeg');
//         const finalimagePath=imagePath.replace('songs','images');

//         // Construct data object
//         let data = {
//             song_name: filename,
//             song_duration: duration,
//             song_imagepath: finalimagePath,
//             song_audiopath: filePath,
//             song_artists:[],
//             playlist:[]
//         };

//         return data;
//     } catch (err) {
//         console.log(err);
//         return null;
//     }
// }

// async function work() {
//     try {
//         const files = await readdir(songsDir);
//         const data = [];
//         await Promise.all(files.map(async (file) => {
//             const filename = file.split('.').slice(0, -1).join('.');
//             const filePath = `${songsDir}/${file}`;
//             const songData = await songInfo(filePath,filename);
//             if (songData) {
//                 data.push(songData);
//             }
//         }));
//         console.log(data)
//         fs.writeFile("f:/Important project/beatx/src/scriptFiles/data.json", JSON.stringify(data), (err) => {
//             if (err) {
//                 console.error('Error writing file:', err);
//             } else {
//                 console.log('Data written to file successfully.');
//             }
//         });
//         // You can do further processing with the 'data' array here
//     } catch (err) {
//         console.error('Error reading directory:', err);
//     }
// }

// work();


// -------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------- Sending data to mongodb ---------------------------------------------------------


const express = require("express");
const fs = require("fs");
const app = express();

const { MongoClient } = require("mongodb");
let dbinstance;

MongoClient.connect("mongodb+srv://SiddharthSharma:siddharth@cluster0.gacgrpw.mongodb.net/")
    .then((client) => {
        dbinstance = client.db("beatx");
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });

app.get("/", (req, res) => {
    fs.readFile("f:/Important project/beatx/src/scriptFiles/songData.json", (err, data) => {
        if (err) {
            console.log(err)
            console.log("error in reading file")
        }
        else{
            const songs=JSON.parse(data);
            songs.forEach((song,index) => {
                song.index=index;
                dbinstance.collection("songs_data").insertOne(song)
                    .then(result => {
                        console.log(`Inserted song with _id: ${result.insertedId}`);
                    })
                    .catch(error => {
                        console.error('Error inserting song:', error);
                    });
            });
            res.send("Songs inserted successfully");
            
        }
    })

    // fs.readFile("f:/Important project/beatx/src/scriptFiles/playlistData.json", (err, data) => {
    //     if (err) {
    //         console.log(err)
    //         console.log("error in reading file")
    //     }
    //     else{
    //         const songs=JSON.parse(data);
    //         songs.forEach(song => {
    //             dbinstance.collection("beatx_playlists_data").insertOne(song)
    //                 .then(result => {
    //                     console.log(`Inserted song with _id: ${result.insertedId}`);
    //                 })
    //                 .catch(error => {
    //                     console.error('Error inserting song:', error);
    //                 });
    //         });
    //         res.send("Songs inserted successfully");
            
    //     }
    // })
})


app.listen(3002, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server Activated");
    }
})