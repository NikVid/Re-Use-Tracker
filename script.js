$(document).ready(function () {
  var $pagination = $("#pagination"), //seleting the element from html
    totalRecords = 0, //on which page the application starts
    records = [], //this will hold all the records for us
    recPerPage = 0, //record per page
    nextPageToken = "", //this will hold records for the next set of records
    totalPages = 0;  //total number of pages, it calculates how many pages to display depending on the number of records
  var API_KEY = "";
  var search = "";
  var duration = "any"; //shorts are 60sec long, short videos: >4min, medium cc 4min. long videos are defined by yt which are 15 or more min long
  var order = "relevance";
  var beforedate = new Date().toISOString(); //it will diplay a date in ISOS format. this is a format that yt api uses
  var afterdate = new Date().toISOString();
  var maxResults=10

  $("#beforedate").val(beforedate)//to enable the  detection of changes in date
  $("#afterdate").val(afterdate)

  $("#beforedate").change(function(){ //whenever these imput boxes change
      beforedate = new Date(this.val()).toISOString()
      $("#beforedate").val(beforedate)
      afterdate = new Date(this.val()).toISOString()
      $("#afterdate").val(afterdate)
  })

  $("#afterdate").change(function(){
    afterdate = new Date(this.val()).toISOString()
    $("#afterdate").val(afterdate)
    beforedate = new Date(this.val()).toISOString()
    $("#beforedate").val(beforedate)
})

  $("#duration").change(function () {
    duration = $(this).children("option:selected").val();
  });
  $("#order").change(function () { //here you enable sorting of videos
    order = $(this).children("option:selected").val(); //to enable the detection of changes in selection in the tab
  });

  $("#myForm").submit(function (e) { //when the form is subitted this call back function will execute
    e.preventDefault(); //here we prevent the autosubition of the form

    search = $("#search").val(); //here we will get the value that the user has typed

    //beforedate = new Date($("#beforedate").val()).toISOString();

    //afterdate = new Date($("#beforedate").val()).toISOString();

    console.log(beforedate);

    API_KEY = "AIzaSyAcyfNE1hvPTkZsATNggbaNIsh2yh-HOi0"; 






//Extracting ids from Search Resource
    var url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY} 
        &part=snippet&q=${search}&maxResults=${maxResults}&publishedAfter=${afterdate}&publishedBefore=${beforedate}&order=${order}&videoDuration=${duration}&type=video`;
//maxResults retreives as many resuts we set in our app
//type=video: we define what kind of infor we want


    $.ajax({
      method: "GET",
      url: url,
      beforeSend: function () {
        $("#btn").attr("disabled", true); //here we disable the button once it is clicked
        $("#results").empty(); //in the video is a bit different (cc 10.50)
      },
      success: function (data) { //when there is a response from the API, this data will be returned to us
        console.log(data);
        $("#btn").attr("disabled", false); //when we click on the button it is again activated
        displayVideos(data); //with this function running we display the data called via API (see the function DisplayVideos created in row cc112)
      },
    });
  });

  function apply_pagination() { //here I wish to invoke the variable which is holding the pagination
    $pagination.twbsPagination({ //the other JS
      totalPages: totalPages,
      visiblePages: 6, //how many pages do I want to have visible
      onPageClick: function (event, page) {
        console.log(event);
        displayRecordsIndex = Math.max(page - 1, 0) * recPerPage; //here we calculate the index
        endRec = displayRecordsIndex + recPerPage;
        console.log(displayRecordsIndex + "ssssssssss" + endRec);
        displayRecords = records.slice(displayRecordsIndex, endRec); //slice the section of the array
        generateRecords(recPerPage, nextPageToken); //function which will generate a new set of records
      },
    });
  }

  $("#search").change(function () {
    search = $("#search").val();
  });

  function generateRecords(recPerPage, nextPageToken) { // this function will make sure taht the whole process of extracting and retreiving data is repeated. so that you get info also on other pages
    var url2 = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}
    &part=snippet&q=${search}&maxResults=${maxResults}&pageToken=${nextPageToken}&publishedBefore=${beforedate}&publishedAfter=${afterdate}&order=${order}&videoDuration=${duration}&type=video`;

    $.ajax({ //this following function are uased to display videos
      method: "GET",
      url: url2,
      beforeSend: function () {
        $("#btn").attr("disabled", true);
        $("#results").empty();
      },
      success: function (data) {
        console.log(data);
        $("#btn").attr("disabled", false);
        displayVideos(data);
      },
    });
  }
//here we get the info that we want
//here we also need the code for the pagination
  function displayVideos(data) {
    recPerPage = data.pageInfo.resultsPerPage; //calculate the recor per page
    nextPageToken = data.nextPageToken;
    console.log(records);
    totalRecords = data.pageInfo.totalResults; 
    totalPages = Math.ceil(totalRecords / recPerPage); //calculate the total records
    apply_pagination();
    $("#search").val(""); // here the function will be applied to html

    var videoData = "";

    $("#table").show();

    data.items.forEach((item) => { 
      //this is a loop where we get the actuall array we want
      //td tag defines a standard cell and tr a row in HTML table
      //to open the link in a new tab use target="blank"

      videoData = `
                    
                    <tr>
                    <td>
                    <img width="250" height="200" src="${item.snippet.thumbnails.high.url}"/>
                    </td>
                    <td>
                    <a target="_blank" href="https://www.youtube.com/watch?v=${item.id.videoId}">
                    ${item.snippet.title}</td>
                    <td>
                    ${item.snippet.description}</td>
                    <td>
                    <${item.snippet.publishedAt}</td>
                    <td>
                    <a target="_blank" href="https://www.youtube.com/channel/${item.snippet.channelId}">${item.snippet.channelTitle}</a>
                    </td>
                    </tr>

                    `; //add extra attributes here

      $("#results").append(videoData); //then we apend this data in the cells which will be displayed in the ui
    });
  }
});

//Extracting ids from Videos Resource