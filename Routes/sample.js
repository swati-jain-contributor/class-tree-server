//Data camp script
//on browser
z=document.querySelectorAll("article a:nth-child(2)");
for(var i=0; i<z.length;i++)
{z[i].setAttribute("target","_blank"); z[i].click();}

//on server
classRouter.route("/savejson").post(function (req, res) {
  var fs = require('fs');
  console.log(req.body);
  fs.appendFile('/Users/swati.jain/Documents/personal/ShareSkill/server/Routes/courses.json', ","+req.body.course, function (err) {
    if (err) {
      console.log(err);
      // append failed
    } else {
      // done
    }
    res.send(helper.formatFailure("Success"));
  })
});

//On inject code
if (location.href.match(/https:\/\/www.datacamp.com\/courses\/*/).length > 0) {
  try {
    var courseInfo = {};
    courseInfo.title = document.querySelector(".header-hero__title").innerText;
    courseInfo.description = document.querySelector(".home-header__description").innerText;
    courseInfo.detailDescription = document.getElementsByClassName("course__description")[0].innerText;
    courseInfo.time = document.querySelector(".header-hero__stat--hours").innerText;
    courseInfo.chapters = [];
    document.querySelectorAll(".chapters.chapters--single-column .chapter").forEach(chapter => {
      let z = {};
      z.title = chapter.querySelector("h4").innerText;
      z.index = chapter.querySelector(".chapter-number").innerText;
      z.description = chapter.querySelector(".chapter__description").innerText;
      z.parts = [];
      chapter.querySelectorAll("h5").forEach(h => z.parts.push(h.innerText));
      courseInfo.chapters.push(z);
    });
    courseInfo.prerequistes = [];
    document.querySelectorAll(".course__prerequisite a").forEach(a => courseInfo.prerequistes.push(a.innerText));
    courseInfo.tracks = [];
    document.querySelectorAll(".course__track a").forEach(a => courseInfo.tracks.push(a.innerText));
    console.log(JSON.stringify(courseInfo));
  }
  catch (ex) {
    let courseInfo = {};
    courseInfo.title = document.querySelector(".dc-course__header-title").innerText;
    courseInfo.description = document.querySelector(".dc-course__header-description").innerText;
    courseInfo.detailDescription = document.querySelector(".dc-course__description-block .dc-course-above-sm").innerText;
    courseInfo.time = document.querySelector(".dc-course__stat").innerText;
    courseInfo.chapters = [];
    document.querySelectorAll("ol .dc-chapter-block-card").forEach(chapter => {
      let z = {};
      z.title = chapter.querySelector("h4").innerText;
      z.index = chapter.querySelector(".dc-u-brad-circle").innerText;
      z.description = chapter.querySelector(".dc-chapter-block-description").innerText;
      z.parts = [];
      chapter.querySelector(".dc-u-color-primary").click();
      courseInfo.chapters.push(z);
    });
    courseInfo.prerequistes = [];
    courseInfo.tracks = [];
    document.querySelector(".course-sidebar-flex-container .dc-card").querySelectorAll("a").forEach(a => courseInfo.tracks.push(a.innerText));
    setTimeout(() => document.querySelectorAll("ol .dc-chapter-block-card").forEach(chapter =>
      chapter.querySelectorAll(".dc-chapter-block-link .dc-u-lh-heading").forEach(a => courseInfo.chapters.find(c => c.index == chapter.querySelector(".dc-u-brad-circle").innerText).parts.push(a.innerText))), 3000);
  }
        setTimeout(() => {
      var http = new XMLHttpRequest();
      var url = 'http://localhost:3000/api/classes/savejson';
      
      var params = JSON.stringify({ course: JSON.stringify(courseInfo) });
      http.open('POST', url, true);
      http.setRequestHeader('Content-type', 'application/json');
      http.send(params);
    }, 5000);
} 
