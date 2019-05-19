require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var callSpotify = new Spotify(keys.spotify);
var axios = require("axios");
var moment = require("moment");
var lineBreak = "\r\n"
var hugeLine = "======================================================================================================================="

function runLiri(){
  if (process.argv[2] === "movie-search") {
    var movieName;
    if (process.argv[3] != null) {
      var searchArray = [];
      for(var i = 3; i < process.argv.length; i++){
      searchArray.push(capitalizeFirstLetter(process.argv[i]));
      }
      movieName = searchArray.join(" ");
    }
    else{
      movieName = "casa+de+mi+padre"
      console.log("Since you did not enter a movie title, here is a recommendation:");
    }
    var queryURL = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    axios.get(queryURL).then(function(response) {
      var output = "Here are your results for " + movieName + ":" + lineBreak +
      response.data.Title + lineBreak +
      "This movie came out in " + response.data.Year + lineBreak +
      "iMDB rating: " + response.data.imdbRating + lineBreak +
      "Rotten Tomatoes rating: " + response.data.Ratings[1]["Value"] + lineBreak +
      "Country: " + response.data.Country + lineBreak +
      "Language: " + response.data.Language + lineBreak +
      "Plot: " + response.data.Plot + lineBreak +
      "Actors: " + response.data.Actors;
      logOutput(output);
    });
  }

  if (process.argv[2] === "spoti-search") {
    var song;
    if (process.argv[3] != null) {
      var searchArray = [];
      for(var i = 3; i < process.argv.length; i++){
      searchArray.push(capitalizeFirstLetter(process.argv[i]));
      }
      song = searchArray.join(" ");
    }
    else {
      song = "the vengabus"
      console.log("No song was entered, check this one out!")
    }
    callSpotify.search({ type: "track", query: song }, function(err, data) {
      if (err) {
        return console.log("Error occurred: " + err);
      }  
      var output = "Here are your results for " + song + ":" + lineBreak;
      for(var i = 0; i < data.tracks.items.length; i++){
        var thisSong = data.tracks.items[i];
        var songArtist = [];
        var songName = thisSong.name;
        var songAlbum = thisSong.album.name
        var duration = moment.duration(thisSong.duration_ms).minutes() + ":" + moment.duration(thisSong.duration_ms).seconds()
        for(var p = 0; p < thisSong.artists.length; p++){
          songArtist.push(thisSong.artists[p].name);
        }
        var content = songArtist.join(", ") + " - " + songName + " (" + duration + ")" + " [" + songAlbum + "]" + lineBreak +
        "Preview: " + thisSong.preview_url + lineBreak + hugeLine + lineBreak;
        output += content
      }
      logOutput(output);
    });
  }

  if (process.argv[2] === "concert-search") {
    var searchArray = [];
    for(var i = 3; i < process.argv.length; i++){
    searchArray.push(capitalizeFirstLetter(process.argv[i]));
    }
    var artist = searchArray.join(" ");
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
    console.log(queryURL);
    axios.get(queryURL).then(function(response) {
      var output = "Here are your results for " + artist + ":" + lineBreak;
      for(var i = 0; i < response.data.length; i++){
        var convDate = moment(response.data[i].datetime).format("MM/DD/YYYY, h:mma");
        var content = convDate + " - " + response.data[i].venue.name + ", " + response.data[i].venue.city + ", " + response.data[i].venue.region + lineBreak;
        output += content
      }
      logOutput(output);
    });
  }

  if (process.argv[2] === "do-this") {
    var fileName = process.argv[3];
    fs.readFile(fileName, "utf8", function(error, data) {
      if (error) {
        return console.log(error);
      }
      var commandArray = data.split(",");
      process.argv[2] = commandArray[0];
      process.argv[3] = commandArray[1];
      runLiri();
    });
  }
}

function logOutput(output){   
  fs.appendFile("liri-log.txt", output + "\r\n\r\n", function(err){
    if (err) {
      console.log(err);
    }
    else{
    console.log(output);
    }
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

runLiri();