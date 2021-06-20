const e=[{id:"/blog/port-based-routing",tags:["networking","iptables"],title:"Port based routing",content:"Recently, my ISP started blocking outbound ssh connections[*] and that hindered my workflow a lot. The only other internet connection I had was my mobile phone’s wireless hotspot (limited data). Somehow, I need to send ONLY the ssh packets through my wireless interface. [skip to script] (*) they blocked port 22 and a few others (no deep packet inspection)  · · · The solution I’m connected to the ISP through my ethernet cable, so my wireless interface was free. Step 1: Mark packets We can use iptables to mark the tcp packets that are going through my eth interface (eno1) that have destination port 22 (ssh runs on 22 by default) sudo iptables -t mangle -I OUTPUT -o eno1 -p tcp --dport 22 -j MARK --set-mark 1  Step 2: Route packets Now that we have marked the packets, we need to make sure they go through my wireless interface (wlo1). For this, we can create a new routing table such that the default gateway is the gateway for my wireless network. (Basically, it means that all packets that use this routing table will go through my wireless network). sudo ip route add table 22 default via 192.168.0.1  Now, we just need to make sure that all marked packets use this routing table sudo ip rule add fwmark 0x1 table 22  Step 3: Fix packets Unfortunately, this setup wouldn’t work. The reason is that although those packets will now go through wlo1, the source IP is messed up (it still would be my IP on eno1 network). This will cause all packets to drop. To fix this, we can do Network Address Translation (NAT) sudo iptables -t nat -I POSTROUTING -o wlo1 -p tcp --dport 22 -j SNAT --to 192.168.0.2  This basically changes the packets source to use my IP on the wireless network (here, 192.168.0.2)  · · · Final script This script takes care of setting up the rules and deleting them when the task is done. It also figures out the gateway and device’s IP on the wireless network.       #!/bin/bash function help { &amp;gt;&amp;amp;2 echo &quot;Usage: $0 up|down&quot; exit 1 } [[ $# == 1 ]] || { help; } # `iptables -A ...` and `ip route/rule add ...` while running &quot;up&quot; # `iptables -D ...` and `ip route/rule del ...`while running &quot;down&quot; case $1 in up) ipt=&quot;-A&quot; ipr=&quot;add&quot; ;; down) ipt=&quot;-D&quot; ipr=&quot;del&quot; ;; *) help ;; esac # get wireless gateway ip wlo1gw=$( ip r | grep -Po &quot;default via K(d+.?){4} .* wlo1&quot; | cut -d&#39; &#39; -f1 ) # get my ip on this wireless nw wlo1ip=$( ip -f inet a show wlo1 | awk &#39;/inet/{ print $2 }&#39; | cut -d/ -f1 ) # any of them empty? ditch [[ -z $wlo1gw || -z $wlo1ip ]] &amp;amp;&amp;amp; { &amp;gt;&amp;amp;2 echo &quot;wlo1 down?&quot;; exit 1; } # create table which sends via wireless iface sudo ip route $ipr table 22 default via $wlo1gw # add rule for marked packets to get routed by the table above sudo ip rule $ipr fwmark 0x1 table 22 # mark ssh packets which are going out via eth iface sudo iptables -t mangle $ipt OUTPUT -o eno1 -p tcp --dport 22 -j MARK --set-mark 1 # since im going to change the iface, set source ip to that iface&#39;s ip sudo iptables -t nat $ipt POSTROUTING -o wlo1 -p tcp --dport 22 -j SNAT --to $wlo1ip  · · ·  This script, along with various other scripts config files can be found in my dotfiles repo."},{id:"/blog/vim-anywhere",tags:["vim","automation","X11"],title:"Editing in vim from anywhere*",content:"I love vim. Once you start using it (properly), you want it everywhere. The modal editing is… …wait, I don’t need to sell vim to you, you came here because you already know how great it is! (*) This should work if you are using X11. · · · How What would you do if you wanted shift what you were typing to vim? This is what comes to mind:  Copy the text Open vim and paste it there Edit Copy it to the system clipboard Paste  Hmmm. Only if I could automate this… Enter xdotool  What is xdotool? This tool lets you simulate keyboard input and mouse activity, move and resize windows, etc. It does this using X11’s XTEST extension and other Xlib functions.   Requirements  xdotool: for simulating copy/paste actions xclip: for getting/setting clipboard content  · · · Code #!/bin/bash # you can set this to the one you use TERMINAL=uxterm file=`mktemp` # a small delay is usually required when dealing with xdotool sleep 0.5s # copy whatever was selected xdotool key ctrl+c # put clipboard contents inside a file xclip -selection clipboard -o &amp;gt; $file # open preferred text editor (vim!) &quot;$TERMINAL&quot; -e &quot;$EDITOR $file&quot; # when done with editing, copy contents to clipboard xclip -selection clipboard -i &amp;lt; $file sleep 0.1s # replace the selection which was just copied xdotool key ctrl+v rm $file  How to use  Save this file somewhere and make sure it can be executed (chmod +x) If not already present, add the directory to PATH (not exactly a necessity but now it’s easier to run it manually too) Make this accessible by a keyboard shortcut. (e.g. for ubuntu) Enjoy  Now, whenever I want to edit something in vim, I select the desired portion and press the hotkey and voila, my text is in vim! Edit, save and close, and the original text gets replaced by this! i3 users A bindsym will do the job. You might want to use a terminal which you don’t use regularly and make it a floating window. Here’s what I did (i3conf): bindsym $mod+q exec vimedit for_window [class=&quot;UXTerm&quot;] floating enable  This made the script available to me with super+q. I don’t have to specify the whole path to the file since I update PATH before loading i3. · · · Demo    Your browser does not support the video tag.   · · ·  This, along with various other cool stuff can be found in my dotfiles repo. So, did you like it? Did I miss something? Did I do something in the wrong way? Please comment below and improve my knowledge!"},{id:"/blog/managing-path",tags:["PATH","GNU/Linux"],title:"How I manage PATH",content:"i use arch btw. Now that we have established that, lets see what the PATH variable is and how it works. According to linfo, PATH is an environmental variable in Linux and other Unix-like operating systems that tells the shell which directories to search for executable files (i.e., ready-to-run programs) in response to commands issued by a user. It increases both the convenience and the safety of such operating systems and is widely considered to be the single most important environmental variable.  What that roughly means is that whenever you type in a command, the shell searches for that name in all the directories present in the PATH variable. The PATH variable looks something like this: $ echo $PATH /usr/bin:/usr/sbin:/some/other/dir:...  It is a list of directories separated by `:`. The shell searches for the executable in each directory and ends the search as soon as it finds a file with the same name. That also means that the order of directories in PATH matters. · · · The usual method The “standard” way of setting the PATH, as seen in the top search result on superuser is this: $ export PATH=$PATH:/your/new/path/here  Now, this works fine when you only need to add a few directories to PATH, and you always do that in a single file at the same place. However, the most common pattern I have seen is: ... export PATH=$PATH:/your/new/path/here ... export PATH=$PATH:/another/new/path/here:/oh/and/a/second/too ... export PATH=$PATH:/here/we/go/again ...  This is bad. Updating the variable to remove a directory can be time consuming, and what if you want to give preference to a directory for an executable? You’ll have to change the order in which they are added to PATH. Doing it when your PATH updates are scattered all over the place doesn’t make it easy. Even if you write all the directories in a single line, it can get a little too long to handle sometimes: export PATH=$PATH:/your/new/path/here:/another/new/path/here:/oh/and/a/second/too:/here/we/go/again:...  · · · What I do I keep all my PATH updates in a single file and source that file in ~/.profile. That file looks like this: #!/bin/bash # directories which get prepended prepend_dirs=( &quot;$HOME/bin&quot; &quot;$HOME/projects/some-project&quot; &quot;$HOME/projects/another-one&quot; ... ) # directories which get appended append_dirs=( &quot;$HOME/.some-dir&quot; &quot;$HOME/.local/bin&quot; &quot;/usr/local/android-studio/bin&quot; &quot;$HOME/flutter/bin&quot; &quot;$HOME/.cargo/bin&quot; ... ) # generate the strings prepend_path=$(IFS=&quot;:&quot;; echo &quot;${prepend_dirs[*]}&quot;) append_path=$(IFS=&quot;:&quot;; echo &quot;${append_dirs[*]}&quot;) # wth is this?! export PATH=&quot;${prepend_path:+${prepend_path}:}$PATH${append_path:+:${append_path}}&quot;  Explanation I maintain two arrays: one for prepending and one for appending. I generate the string (prepend_path, append_path) which gets added to PATH. This does not pollute your IFS, since the whole command is ran in a subshell. Also, printing ${array[*]} expands to all elements separated by the first character of IFS, which currently is `:`. The last line is special. It could simply have been export PATH=&quot;$prepend_path:$PATH:$append_path&quot;  Although, a problem might arise when either prepend_path or append_path is empty. The final PATH might end up looking like this: :/usr/bin:/usr/sbin:...:/home/user/bin:. Solution: bash array parameter expansion  ${parameter:+word}  &amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;If parameter is null or unset, nothing is substituted, otherwise the expansion of word is substituted.  So, if either of them are empty, the corresponding `:` won’t be added. Cool! This way, you can easily add/remove directories from PATH and easily manage the order too. · · ·  This file, along with various other config files can be found in my dotfiles repo. So, did you like it? Did I miss something? Did I do something in the wrong way? Please comment below and improve my knowledge!"},{id:"/blog/under-construction",tags:[],title:"Under Construction",content:"I want to write many more articles. I will write more as soon as I get the time! Thank you for your patience!"}];function t(){let t=$("#searchBar").val().toLowerCase(),o=$("div.posts"),i=$("#not-found");if(history.replaceState(null,"",`?q=${t}`),i.html(""),o.children().each((function(){$(this).css({display:"flex"})})),!t.length)return;let a=function(t){let o=[];return e.forEach((e=>{(function(e,t){return e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t)||e.tags.join("|").toLowerCase().includes(t)})(e,t)&&o.push(e.id)})),o}(t);a.length||i.html("No such post has been written (yet)!"),o.children().each((function(){a.includes($(this).attr("id"))||$(this).css({display:"none"})}))}document.addEventListener("DOMContentLoaded",(function(){let e=$("#searchBar"),o=new URLSearchParams(window.location.search),i=o.get("q");o.has("q")&&(e.val(i),t()),e.on("input propertychange",t)}));