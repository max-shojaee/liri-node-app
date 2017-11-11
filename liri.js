
//===========================================================
// Import external resources
//===========================================================

var fs = require('fs');
var keys = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var Request = require('request');

//===========================================================
// Parse the user command and call the corresponding function
//===========================================================

var command = process.argv[2];

// check if there is an argument given for the command
// and retrieve the argument

var argument = "";
if (process.argv.length > 3)
  argument = process.argv.slice(3).join(' ');

switch (command)
{
    case "my-tweets":
      getMyTweets();
      break;

    case "spotify-this-song":
      // if no song given, then default to "The Sign"
      if (argument === "")
        argument = "The Sign"
      spotifyThisSong(argument);
      break;

    case "movie-this":
      // if no movie given, then default to "Mr. Nobody"
      if (argument === "")
        argument = "Mr. Nobody"
      movieThis(argument);
      break;

    case "do-what-it-says":
      doWhatItSays();
      break;

    default: 
      console.log("usage: node liri.js <command>, where command is one of the following:");
      console.log("1. my-tweets");
      console.log("2. spotify-this-song");
      console.log("3. movie-this");
      console.log("4. do-what-it-says");
      break;
}

//===========================================================
// Retrieve the last 20 tweets and print to the console
//===========================================================
function getMyTweets()
{
    // Initialize client authentication for accessing Twitter
    var client = new Twitter({
      consumer_key: keys.twitterKeys.consumer_key,
      consumer_secret: keys.twitterKeys.consumer_secret,
      access_token_key: keys.twitterKeys.access_token_key,
      access_token_secret: keys.twitterKeys.access_token_secret
    });

    var params = {screen_name: 'maxfromsd'};

    // Retrieve the tweets
    client.get('statuses/user_timeline', params, function(error, tweets, response) 
    {
        // If any errors encountered, log the error to the console and return.
        if (error !== null)
            return console.log(error);

        //Print the last 20 tweets or less if there are less than 20 tweets
        length = 20;
        if (tweets.length < length)
          length = tweets.length;

        for (var i=0; i < length; i++)
        {
          var date = tweets[i].created_at.replace("+0000", "");
          console.log("Date: " + date + "   Tweet: "+tweets[i].text);
        }
    });
}

//===========================================================
// Retrieve the information for the given song from Spotify
//===========================================================
function spotifyThisSong(song)
{
    // Initialize client authentication for accessing Spotify
    var spotify = new Spotify({
      id: keys.spotifyKeys.id,
      secret: keys.spotifyKeys.secret
    });
  
    // Request the song's information from Spotify, 
    // limit the number of returned records to 1

    spotify.search({ type: 'track', query: song, limit:1}, function(err, data) 
    {
       // If any errors encountered, log the error to the console and return.
        if (err !== null) 
          return console.log('Error occurred: ' + err);
       
        // Parse through the Spotify data, this algorithm works for any number of records

        for (var i=0; i<data.tracks.items.length; i++)
        {
            // Print all artist(s) name(s)

            for (var j=0; j<data.tracks.items[i].album.artists.length; j++)
            {
                  console.log("Artists: "+data.tracks.items[i].album.artists[j].name); 
            }

            // Print song's name

            console.log("Song's Name: "+data.tracks.items[i].name); 

            // Print preview link
            for (var j=0; j<data.tracks.items[i].artists.length; j++)
            {
              console.log("Preview Link: "+data.tracks.items[i].artists[j].external_urls.spotify);
            }

            // Print album name
            console.log("Album: "+data.tracks.items[i].album.name); 
        }
    });
}


//===========================================================
// Retrieve the information for the given movie
//===========================================================
function movieThis(movie)
{
  // Prepare the movie name to pass to OMDB by replacing " " with "+"
  var movieName = movie.replace(/" "/g, "+");

  // Prepare the URL by adding the OMDB API key
  var movieUrl = "https://www.omdbapi.com/?t="+movieName+"&apikey="+keys.omdb_key;

  // Request the information for the given movie from OMDB
  Request(movieUrl, function (error, response, body) 
  {
      // If any errors encountered, log the error to the console and return.
      if (error !== null)
        return console.log(error);

      // Parse the movie info from JSON record returned by Request
      var movieInfo = JSON.parse(body);
 

      // Print the movie information to the console

      console.log("Movie Title: "+ movieInfo.Title);
      console.log("Year Released: "+ movieInfo.Year);
      console.log("IMDB Rating: "+ movieInfo.imdbRating);

      for (var i=0; i<movieInfo.Ratings.length; i++)
      {
        if (movieInfo.Ratings[i].Source === "Rotten Tomatoes")
          console.log("Rotten Tomatoes Rating: "+ movieInfo.Ratings[i].Value);
      }

      console.log("Country: "+ movieInfo.Country);
      console.log("Language: "+movieInfo.Language);
      console.log("Plot: "+ movieInfo.Plot);
      console.log("Actors: "+ movieInfo.Actors);
  });
}


//===========================================================
// Read the command lines from the Random.txt and process each
// command by calling the corresponding function.
//===========================================================
function doWhatItSays()
{
  fs.readFile("random.txt", "utf8", function(error, data) {

  // If any errors encountered, log the error to the console and return.
  if (error !== null) 
    return console.log(error);

  // Split data on \r\n, this will read command lines into an array
  var dataArr = data.split("\r\n");

  for (var i=0; i <dataArr.length; i++)
  { 
    // Split each command line "," to get the command and the argument
    var command = dataArr[i].split(",");

    if (command.length > 0)
    { 
      // Process each command 
      switch(command[0])
      {
        case "my-tweets":
          getMyTweets();
          break;

        case "spotify-this-song":
          // Set the default song to "The Sign"
          var song = "The Sign"

          //check to see if a song name is given
          if (command.length > 1)
          {
            song = command[1].replace(/"\"/g, "");
          }
          spotifyThisSong(song);
          break;


        case "movie-this":
          // Set the default movie to "Mr. Nobody"
          var movie = "Mr. Nobody"

          //check to see if a movie name is given
          if (command.length > 1)
          {
            movie = command[1].replace(/"\"/g, "");
          }
          movieThis(movie);
          break;

        // Skip unrecognized commands
        default: break;

      } // end switch
    } // end if
  } // end for

});

} //end doWhatIsSays()