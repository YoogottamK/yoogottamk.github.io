const e=[{id:"/projects/under-construction",tags:[],title:"Under Construction",content:"I have worked on a lot of other projects, I need some time to put them up here.Thank you for your patience!"},{id:"/projects/c-shell",tags:["shell","c"],title:"ysh",content:"This is a shell completely written in C which supports background / foreground jobs, semicolon list of commands, input / output redirection, piping, escaping within quotes(both double and single) and handles some signals like SIGINT(&amp;lt;C-c&amp;gt;) and SIGTSTP(&amp;lt;C-z&amp;gt;).FeaturesThe following shell builtins were implemented:      cd (supports absolute / relative paths)      pwd       echo       history (stored last 20 commands, accessible with the up arrow)      exit       pinfo (gives detailed info about any process given it&#39;s pid)      ls (yes, it was implemented again, supported &#39;-a&#39; and &#39;-l&#39; flags)      {un}setenv (allowed removal and creation of environment variables)      jobs (like ps)      kjob (sends a signal to a process)      fg / bg (moves a process to foreground or background)      overkill (stops all background processes)      ... (and some more)  Any external command was executed using the exec syscallThe following features were implemented:      semicolon(;) seperated list of commands can be passed, whitespace is ignored      Execution of system commands with or without arguments, in background or foreground      Notifying when and how the background process terminated      Input and output redirection, including appending to a file      Piping of commands      Handling SIGINT [C-c] and SIGTSTP [C-z] signals      Command recall using up arrow key      echo supports printing environment variables      Spaces are escaped within quotes. i.e., vim &quot;bad name.txt&quot; will work as expected  · · ·Image(s)                                Previous            Next  · · ·CodeThe code, along with instructions to build and use it can be found on github, at yoogottamk/ysh."},{id:"/projects/website",tags:["jekyll","html","js","css","bootstrap"],title:"website",content:"This website (+blog) was built using jekyll. The theme was created from scratch. I also used bootstrap. I tried to follow best practices everywhere and ended up using almost all of jekyll’s features.Highlights  The first thing that strikes you in the homepage is the terminal emulator. It supports some commands like ls, cd, etc. I liked the idea of navigating a website like any other directory on your computer and implemented it.  Extra time was spent on the special 404 page, which lists the urls available on the website (generated using jekyll) in increasing order of edit distances, so that you can reach the page you intended to go without having to change the url.  The blog and projects pages provide a search functionality, with which you can search by title, tags and even content!  The content being served to you is minified, using a custom github pages deployment, using gulp.· · ·Image(s)                                                                Previous            Next  · · ·CodeThis website’s code, along with the gulp setup can be found on github, at yoogottamk/yoogottamk.github.io."},{id:"/projects/visudoku",tags:["opencv","ml","sudoku","python","cpp"],title:"ViSudoku",content:"This is a python (jupyter notebook) script which uses OpenCV for extracting the sudoku puzzle, scikit-learn for digit recognition and a backtracking algo to solve the puzzle.OverviewHere is a basic outline of how this algorithm works  Once I get the image, the largest &#39;box&#39; is assumed to be the sudoku puzzle.  The box is then extracted from the image and &#39;flattened&#39;.  Now that we have the puzzle, we need to get the individual digits. For this, I &#39;reinforce&#39; the grid by drawing more lines above it. I also add the bounding box seperately. This was done to &#39;strongly&#39; divide to seperate out the individual digits.  The next step is to extract all the &#39;boxes&#39; in the image. The largest 82 are picked. The largest one is the whole box and the next 81 are the individual boxes.  Now that we have each digit, it is necessary to have them in the correct order to reconstruct the puzzle. For this, I use the central coordinates to arrange them back in place.  Now, I use a knn classifier to recognize each digit (with near perfect accuracy)  The only thing left is to solve this puzzle, which can be done by recursion.  It has been packaged as a docker image with a UI  The solution is cached so, if the same image is given, it runs much faster· · ·Image(s)                                                                                                                                Previous            Next  · · ·Demo          Your browser does not support the video tag.   · · ·CodeThis code, along with the printed digit training data can be found on github, at yoogottamk/visudoku."}];document.addEventListener("DOMContentLoaded",(function(){let t=$("#searchBar");t.on("input propertychange",(function(){let o=t.val().toLowerCase(),i=$("div.projects"),s=$("#not-found");if(s.html(""),i.children().each((function(){$(this).css({display:"flex"})})),!o.length)return;let n=function(t){let o=[];return e.forEach(e=>{(function(e,t){return e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t)||e.tags.join("|").toLowerCase().includes(t)})(e,t)&&o.push(e.id)}),o}(o);n.length||s.html("I haven't worked on this (yet)!"),i.children().each((function(){n.includes($(this).attr("id"))||$(this).css({display:"none"})}))}))}));