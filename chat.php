<?php
// chat.php - PHP version of chat interface with session management
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php');
    exit;
}

// Get user data from session
$username = $_SESSION['username'];
$email = $_SESSION['email'];
$user_id = $_SESSION['user_id'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FRIEND AI</title>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="pink.css">
    <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
</head>
<body>
    <div class="main">
        <!-- ---------------------left div ------------------ -->
        <div class="left">
            <div class="left-end">
                <div class="logo" onclick="togglenew()">
                    <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png" alt="FRIEND AI LOGO" data-aos="fade-left" data-aos-duration="1500">
                    <span class="fom">FRIEND AI</span>
                </div>

                <!-- ------------------- set on left ------------------ -->
                <div class="sets" id="sets">
                    <i class="bx bx-sun " id="light-dark"></i>
                    <a href="" class="set-list"> 
                        <i class="bx bx-history"></i>
                        <p>Activity</p>
                        <span class="bx bx-chevron-right"></span>
                    </a>
                    <a href="shortcut.html" class="set-list">
                        <i class="bx bx-analyse"></i>
                        <p>short cuts</p>
                        <span class="bx bx-chevron-right"></span>
                    </a>
                    <a href="about.html" class="set-list">
                        <i class="bx bx-award"></i>
                        <p>About us</p>
                        <span class="bx bx-chevron-right"></span>
                    </a>
                </div>
        
                <div class="set">
                    <i class="bx bx-cog set_btn" onclick="toggleset()"></i>
                </div>
            </div>
        </div>

        <!-- ------------------center div  -------------------- -->
        <div class="center">
            <div class="chat-area">
                <div class="result"></div>
            </div>

            <div class="hello-text" id="hello-text">
                <img src="img/Droid@1-1536x776.png" alt="" class="robot">
                <p class="usname">HI, <span><?php echo htmlspecialchars($username); ?></span></p>
                <samp>how can i help you today</samp>
                <div class="lk-group">
                    <a href="image.html" class="lk1">
                        <i class="bx bx-image"></i>
                        <p> promt for image</p>
                    </a>
                    <a href="maths.html" class="lk4">
                        <i class="bx bx-math"></i>
                        <p> problem solver</p>
                    </a>
                </div>
            </div>

            <div class="inarea" id="inarea">
                <div class="input">
                    <input type="text" placeholder="..." id="input-field">
                </div>
                <div class="icons_group">
                    <div class="icon-left">
                        <input type="file" id="real-file" hidden="hidden">
                        <i class="bx bx-paperclip" id="paperclip"></i>
                        <i class="bx bx-microphone " id="phone"></i>
                        <i class="bx bx-extension" id="extension" onclick="toggletool()"></i>
                        <i class="bx bx-paper-plane" id="plane"></i>
                    </div>
                    <div class="icon-left"></div>
                </div>
            </div>
            <p class="morul">The Friend AI is your best friend for study and work</p>
        </div>

        <!-- --------------right side div------------------------ -->
        <div class="right">
            <div class="right-end">
                <div class="tools">
                    <i class="bx bx-customize tool_but" type="" onclick="toggletool()"></i>
                </div>
                <div class="profile">
                    <img src="img/res.svg" alt="profile" class="profil" onclick="toggleUser()">
                </div>
            </div>

            <!-- ---------tools drop down--------- -->
            <div class="drop-end">
                <div class="tool" id="tool">
                    <a href="maths.html" class="tool-list">
                        <i class="bx bx-math"></i>
                        <p>Maths Teacher</p>
                        <span class="bx bx-chevron-right"></span>
                    </a>
                    <a href="image.html" class="tool-list">
                        <i class="bx bx-image"></i>
                        <p>Image Generater</p>
                        <span class="bx bx-chevron-right"></span>
                    </a>
                </div>
            </div>

            <!-- -------------user drop down ----------- -->
            <div class="user-drop" id="user-drop" data-aos="fade-left" data-aos-duration="1500">
                <div class="name user-ld">
                    <img src="img/back.jpg" alt="">
                    <h3><?php echo htmlspecialchars($username); ?></h3>
                </div>
                <div class="email user-ld">
                    <p><?php echo htmlspecialchars($email); ?></p>
                </div>
                <hr>
                <a href="update.html" class="user-ld">
                    <i class="bx bx-cloud-upload"></i>
                    <p>Update page</p>
                    <span class="bx bx-chevron-right fon"></span>
                </a>
                <a href="" class="user-ld">
                    <i class="bx bx-history"></i>
                    <p>recently</p>
                    <span class="bx bx-chevron-right"></span>
                </a>
                <a href="logout.php" class="user-ld">
                    <i class="bx bx-exit"></i>
                    <p>logout</p>
                    <span class="bx bx-chevron-right"></span>
                </a>
            </div>
        </div>
    </div>

    <!-- Pass PHP data to JavaScript -->
    <script>
        // User data available in JavaScript
        const userData = {
            id: <?php echo $user_id; ?>,
            username: '<?php echo addslashes($username); ?>',
            email: '<?php echo addslashes($email); ?>'
        };
    </script>

    <script type="module" src="https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js"></script>
    <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
    <script> AOS.init(); </script>
    <script defer src="pink.js"></script>

    <script>
        let sets = document.getElementById('sets');
        let tool = document.getElementById('tool');
        let user_drop = document.getElementById('user-drop');
        
        function toggleset() {
            sets.classList.toggle('open'); 
        }

        function toggletool() {
            tool.classList.toggle('open'); 
            user_drop.classList.remove('open');
        }
        
        function toggleUser() {
            user_drop.classList.toggle('open'); 
            tool.classList.remove('open'); 
        }
        
        const realfilebtn = document.getElementById("real-file");
        const paperclip = document.getElementById("paperclip");

        paperclip.addEventListener("click", function(){
            realfilebtn.click();
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.tool') && !event.target.closest('.tool_but')) {
                tool.classList.remove('open');
            }
            if (!event.target.closest('.user-drop') && !event.target.closest('.profil')) {
                user_drop.classList.remove('open');
            }
            if (!event.target.closest('.sets') && !event.target.closest('.set_btn')) {
                sets.classList.remove('open');
            }
        });

        document.getElementById("input-field").addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                document.querySelector(".inarea").classList.add("moved");
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                document.querySelector(".inarea").classList.add("moved");
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "/" && !event.target.matches("input, textarea")) {
                event.preventDefault();
                document.querySelector(".inarea input").focus();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.target.matches("input, textarea")) {
                event.preventDefault();
                document.querySelector(".inarea input").focus();
            }
        });

        // Welcome message 
        document.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                document.querySelector(".inarea").classList.add("moved");    
                document.getElementById("hello-text").classList.add("hidden");
            }
        });

        function togglenew() {
            document.querySelector('.chat-area').innerHTML = '';
            document.getElementById("hello-text").classList.remove("hidden");
            document.querySelector('.inarea').classList.remove("moved");
        }

        document.addEventListener("keydown", function(event) {
            if (event.ctrlKey && event.key === "?") {
                event.preventDefault();
                togglenew();
            }
        });

        // New chat shortcut (Ctrl+N)
        document.addEventListener("keydown", function(event) {
            if (event.ctrlKey && event.key === "n") {
                event.preventDefault();
                togglenew();
            }
        });
    </script>
</body>
</html>