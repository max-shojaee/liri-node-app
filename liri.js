var fs = require('fs');
var keys = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var Request = require('request');

var command = process.argv[2];

//===========================================================
//
//===========================================================

switch (command)
{
	case "my-tweets":
    getMyTweets();
    break;

	case "spotify-this-song":
    var song = process.argv.slice(3).join(' ');
    spotifyThisSong(song);
    break;

	case "movie-this":
    var movie = process.argv.slice(3).join(' ');
    movieThis(movie);
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
//
//===========================================================
function getMyTweets()
{
  var client = new Twitter({
    consumer_key: keys.twitterKeys.consumer_key,
    consumer_secret: keys.twitterKeys.consumer_secret,
    access_token_key: keys.twitterKeys.access_token_key,
    access_token_secret: keys.twitterKeys.access_token_secret
  });

  var params = {screen_name: 'maxfromsd'};

  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error)
      console.log(tweets);
    else
      console.log(error);
  });
}

//===========================================================
//
//===========================================================
function spotifyThisSong(song)
{

    var spotify = new Spotify({
    id: keys.spotifyKeys.id,
    secret: keys.spotifyKeys.secret
  });
  
  spotify.search({ type: 'track', query: song}, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
   
    console.log(data.tracks.items[0].album.artists[0].name); 
    console.log(data.tracks.items[0].album.name); 
    console.log(data.tracks.items[0].artists);
    console.log(data.tracks.items[0].artists[0].external_urls.spotify);
    console.log(data.tracks.items[0].name); 

    //fs.writeFile("./log.txt", JSON.stringify(data.tracks.items[0]));
  });
}


//===========================================================
//
//===========================================================
function movieThis(movie)
{
  var movieName = movie.replace(/" "/g, "+");

  var movieUrl = "https://www.omdbapi.com/?t="+movieName+"&apikey="+keys.omdb_key;

  console.log(movieUrl);

  Request(movieUrl, function (error, response, body) {
    console.log(error);
    console.log('body:', body);
  });
}


//===========================================================
//
//===========================================================
function doWhatItSays()
{
  fs.readFile("random.txt", "utf8", function(error, data) {

  // If the code experiences any errors it will log the error to the console.
  if (error) {
    return console.log(error);
  }

  // Split data by \r\n
  var dataArr = data.split("\r\n");

  for (var i=0; i <dataArr.length; i++)
  {
    var command = dataArr[i].split(",");

    if (command.length > 0)
    {
      switch(command[0])
      {
        case "my-tweets":
          getMyTweets();
          break;

        case "spotify-this-song":
          if (command.length > 1)
          {
            var sub_str = command[0].replace(/"\"/g, "");
            spotifyThisSong(song);
          }
          break;

        case "movie-this":
          if (command.length > 1)
          {
            var movie = parseString(command[1]);
            movieThis(movie);
          }
          break;

        default: break;

      } // end switch
    } // end if
  } // end for

});

} //end doWhatIsSays()