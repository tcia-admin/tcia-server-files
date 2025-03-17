// Add this check at the start of your file to prevent duplicate initialization
if (window.tciaInitialized) {
    console.log('TCIA script already initialized, skipping');
} else {
    window.tciaInitialized = true;
    
    function poissonDiskSampling(width, height, radius, k = 30) {
        const grid = [];
       const active = [];
       const cellSize = radius / Math.sqrt(2);
       const cols = Math.floor(width / cellSize);
       const rows = Math.floor(height / cellSize);
       
       for (let i = 0; i < cols * rows; i++) {
           grid[i] = undefined;
       }
       
       function addSample(sample) {
           active.push(sample);
           const i = Math.floor(sample.x / cellSize);
           const j = Math.floor(sample.y / cellSize);
           grid[i + j * cols] = sample;
       }
       
       addSample({x: Math.random() * width, y: Math.random() * height});
       
       while (active.length > 0) {
           const randomIndex = Math.floor(Math.random() * active.length);
           const point = active[randomIndex];
           let found = false;
       
           for (let n = 0; n < k; n++) {
               const angle = Math.random() * Math.PI * 2;
               const newRadius = radius + Math.random() * radius;
               const newX = point.x + Math.cos(angle) * newRadius;
               const newY = point.y + Math.sin(angle) * newRadius;
       
               if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                   let cellX = Math.floor(newX / cellSize);
                   let cellY = Math.floor(newY / cellSize);
                   let valid = true;
       
                   for (let i = -1; i <= 1; i++) {
                       for (let j = -1; j <= 1; j++) {
                           const neighbor = grid[(cellX + i) + (cellY + j) * cols];
                           if (neighbor) {
                               const dx = neighbor.x - newX;
                               const dy = neighbor.y - newY;
                               if (dx * dx + dy * dy < radius * radius) {
                                   valid = false;
                               }
                           }
                       }
                   }
       
                   if (valid) {
                       found = true;
                       addSample({x: newX, y: newY});
                       break;
                   }
               }
           }
       
           if (!found) {
               active.splice(randomIndex, 1);
           }
       }
       
       return grid.filter(point => point !== undefined);
   }
   
   function addStarBackground(scene, width, height, options = {}) {
       const {
           starDensity = 35,
           minStarSize = 0.2,
           maxStarSize = 1.2,
           starColor = 0xFFFFFF,
           zPosition = -100,
           twinkleInterval = 20, // seconds between twinkles
           twinkleDuration = 1 // seconds for twinkle animation
       } = options;
   
       const stars = poissonDiskSampling(width, height, starDensity);
       const geometry = new THREE.BufferGeometry();
       const positions = new Float32Array(stars.length * 3);
       const sizes = new Float32Array(stars.length);
       const colors = new Float32Array(stars.length * 3);
   
       const color = new THREE.Color(starColor);
   
       stars.forEach((star, index) => {
           positions[index * 3] = star.x - width / 2;
           positions[index * 3 + 1] = star.y - height / 2;
           positions[index * 3 + 2] = zPosition;
           sizes[index] = Math.random() * (maxStarSize - minStarSize) + minStarSize;
           color.toArray(colors, index * 3);
       });
   
       geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
       geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
       geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
   
       const material = new THREE.PointsMaterial({
           size: 1,
           vertexColors: true,
           blending: THREE.AdditiveBlending,
           transparent: true
       });
   
       const starField = new THREE.Points(geometry, material);
       scene.add(starField);
   
       function twinkle() {
           if (window.innerWidth <= 768) {
               console.log("Twinkling skipped: viewport width is 768px or less");
               return;
           }
   
           const index = Math.floor(Math.random() * stars.length);
           const colors = starField.geometry.attributes.color.array;
   
           console.log(`Star ${index} is twinkling at ${new Date().toLocaleTimeString()}`);
   
           const originalColor = new THREE.Color().fromArray(colors, index * 3);
           const brightColor = originalColor.clone().multiplyScalar(3);
   
           gsap.to(colors, {
               duration: twinkleDuration / 2,
               [index * 3]: brightColor.r,
               [index * 3 + 1]: brightColor.g,
               [index * 3 + 2]: brightColor.b,
               ease: "power2.out",
               onUpdate: () => {
                   starField.geometry.attributes.color.needsUpdate = true;
                   console.log(`Star ${index} brightness increased`);
               },
               onComplete: () => {
                   gsap.to(colors, {
                       duration: twinkleDuration / 2,
                       [index * 3]: originalColor.r,
                       [index * 3 + 1]: originalColor.g,
                       [index * 3 + 2]: originalColor.b,
                       ease: "power2.in",
                       onUpdate: () => {
                           starField.geometry.attributes.color.needsUpdate = true;
                           console.log(`Star ${index} brightness decreased`);
                       },
                       onComplete: () => console.log(`Star ${index} finished twinkling`)
                   });
               }
           });
       }
   
       console.log(`Starting twinkling effect. Interval: ${twinkleInterval} seconds, Duration: ${twinkleDuration} seconds`);
       setInterval(twinkle, twinkleInterval * 1000);
   
       return starField;
   }
   
   
   // Instead of directly declaring scene, check if it already exists
   window.tciaScene = window.tciaScene || new THREE.Scene();
   const scene = window.tciaScene;
   
   // Use window.tciaCamera instead of declaring a new camera
   window.tciaCamera = window.tciaCamera || new THREE.OrthographicCamera(
       window.innerWidth / -2, window.innerWidth / 2, 
       window.innerHeight / 2, window.innerHeight / -2, 
       0.1, 1000
   );
   const camera = window.tciaCamera;
   camera.position.z = 1;
   
   const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('star-background'), alpha: true });
   renderer.setSize(window.innerWidth, window.innerHeight);
   
   // Initialize starBackground variable
   let starBackground = null;
   
   // Comment out or remove the star background initialization
   // starBackground = addStarBackground(scene, window.innerWidth, window.innerHeight, {
   //     twinkleInterval: 20, // Twinkle every 20 seconds
   //     twinkleDuration: 1 // Twinkle animation lasts 1 second
   // });
   
   // Modify the animate function to only handle card animations
   function animate() {
       requestAnimationFrame(animate);
       // renderer.render(scene, camera); // Comment out star rendering
   }
   
   // Optional: hide the canvas element
   const starCanvas = document.getElementById('star-background');
   if (starCanvas) {
       starCanvas.style.display = 'none';
   }
   
   // Handle window resize with improved error handling
   const debounce = (func, delay) => {
       let timeoutId;
       return (...args) => {
           clearTimeout(timeoutId);
           timeoutId = setTimeout(() => func(...args), delay);
       };
   };

   // Use a safer approach for window resize
   const safeResize = debounce(() => {
       try {
           const width = window.innerWidth;
           const height = window.innerHeight;
           
           if (camera) {
               camera.left = width / -2;
               camera.right = width / 2;
               camera.top = height / 2;
               camera.bottom = height / -2;
               camera.updateProjectionMatrix();
           }
           
           if (renderer) {
               renderer.setSize(width, height);
           }
           
           // Only recreate star background if it exists and scene exists
           if (starBackground && scene) {
               scene.remove(starBackground);
               starBackground = addStarBackground(scene, width, height);
           }
       } catch (err) {
           console.warn('Error during resize:', err);
       }
   }, 250);

   // Replace the existing resize listener
   window.removeEventListener('resize', window.tciaResizeHandler);
   window.tciaResizeHandler = safeResize;
   window.addEventListener('resize', window.tciaResizeHandler);
   
   // Browser detection utility
   function isEdgeBrowser() {
       return navigator.userAgent.indexOf("Edge") > -1 || 
              (navigator.userAgent.indexOf("Edg") > -1 && !navigator.userAgent.indexOf("Chrome"));
   }
   
   // Check if mobile
   const isMobile = window.innerWidth <= 768;
   
   // Team members data
   const teamMembers = [
       {
           name: "Aasim Shabazz",
           role: "Co-Founder & President",
           bio: "Aasim Shabazz is a vision-driven technologist, co-founder, and president of Twin Cities Innovation Alliance (TCIA). Aasim drives innovative solutions to complex problems faced by communities and organizations. Aasim serves as the architect of the TCIA's annual Data 4 Public Good conference—a cultivated experience for meaningful contributions, co-powering, change-making, and relationship-building in digital justice. Throughout his career, Aasim has contributed leadership by serving on various boards and commissions, including advancing Minnesota equitable light rail development—where he served as a founding co-chair of the Blue Line Coalition. \nAasim is also lead innovator and steward leader of iAskc, a digital transformation company providing organizational agility solutions for enterprises across the globe. Aasim brings his experience as a visionary thought leader and certified Scaled Agile® Program Consultant Expert Agile, to support organizations in improving their value delivery from a people-focused approach. Aasim effectively leverages his experience of 20+ years of working in the areas of Agile teams, Design Thinking, Lean Practices, SAFe Transformation, Change Management, Strategic Planning, Organizational Design, and Human Resource Strategy.",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/47442c50-0cbf-4ca3-8502-1a4dd9c490f8/Aasim+Shabazz_+headshot+1.png?content-type=image%2Fpng"
       },
       {
           name: "Yashada Nikam",
           role: "Data Scientist",
           bio: "Yashada Nikam holds a Master's Degree in Data Science and works as a Data Scientist at Twin Cities Innovation Alliance. \n With a curious and analytical mindset, she is adept at diving deep into diverse datasets, asking insightful questions, and presenting compelling narratives through data visualization, making it accessible and relatable. \n When she's not glued to her computer, Yashada loves to bake sugary goods, write prose poetry and time loses all its meaning once she picks up a book!",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/838bc152-f869-4a44-99a4-a6b13725339a/YN_Headshot_TCIA_1080x1053_ORIG.jpg?content-type=image%2Fjpeg"
       },
       {
           name: "Khanh Tu",
           role: "Digital Marketer and Graphic Designer",
           bio: "Khanh Tu is a digital marketer and graphic designer who develops and executes effective digital marketing strategies for TCIA. She holds a Bachelor of Science in Marketing and is a self-taught graphic designer. Khanh creates visually compelling designs while ensuring brand consistency across TCIA's platforms, enhancing its visual identity. \n In her free time, Khanh enjoys working on digital art and personal creative projects, including pen-palling, bullet journaling, and film photography.",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/4c12211a-3a22-4999-9651-3ccad025fa59/KHANH-TU_HEADSHOT_400x400_ORIG.png?content-type=image%2Fpng"
       },
       {
           name: "Jadyn Mardy",
           role: "Digital Marketer and Video Editor",
           bio: "Jadyn is a marketing coordinator and video editor for TCIA and has been thrilled to be a part of the team for over a year. Jadyn is a senior double majoring in Child Studies and Film and Media studies and largely manages TCIA's social media and communication presents and edits all video content. Along with a love for storytelling through visual media, she loves writing about aspects of data justice, AI use and summarizing reports that explore the same. \n Originally from NY, Jadyn is currently a Bostonian impersonator who loves to rollerblade, watch movies and stay up late writing.",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/98b7f513-dd3f-4f57-a461-c22584c4fdbb/Jadyn+Mardy.png?content-type=image%2Fpng"
       },
       {
           name: "Marika Pfefferkorn",
           role: "Co-founder Twin Cities Innovation Alliance (TCIA) & Executive Director, Midwest Center for School Transformation (MCST)",
           bio: "As an interdisciplinary and cross-sector thought leader and community advocate Marika Pfefferkorn is a change agent working to transform educational ecosystems and scale successes. Ms. Pfefferkorn's work begins in community and arcs to the regional and national scope. Her experience covers policy, leadership, research, community building, and engagement. She integrates cultural wisdom, and the arts and applies a restorative lens to upend punitive conditions in education and society, leading with a vision for collective liberation and self-determination. \n In an effort, to disrupt the Cradle to Prison Algorithm (an expansion of the School to Prison Pipeline/ School and Prison Nexus), Ms. Pfefferkorn teaches, trains, and coaches' youth, families, and systems on youth data criminalization at the intersection of education and technology. She co-powers with a diversity of communities to center data justice through projects and programming like the No Data About Us Without Us Fellowship and Digital Justice Ideathon. Ms. Pfefferkorn's work demonstrates an agile approach to community engagement, meeting people and systems where they are to educate, equip and activate solutions that reflect and benefit communities. \n She has successfully co-led campaigns to end discriminatory suspension practices in Minnesota schools, to remove the presence of police in Minneapolis and St. Paul schools, to increase investment in indigenous restorative practices in education. She co-developed and co-teaches Carcerality and Education at Carleton College.  \n She is a can organizing member of Education for Liberation Minnesota Chapter, a founding member of the Racial Justice S.T. E. A.M. Collective and co-founder of the No Tech Criminalization in Education (NOTICE) Coalition, and the Stop the Cradle to Prison Algorithm Coalition.",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/ea26ba91-d173-4d56-ae12-ba17f311b48c/Marika-3.jpeg?content-type=image%2Fjpeg"
       },
       {
           name: "Dr. Talaya Tolfree",
           role: "TCIA Board Member",
           bio: "",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/dcafb1bb-c840-4d82-82f2-f2bf2cf51d33/Dr.+Talaya+Tolfree.jpeg?content-type=image%2Fjpeg"
       },
       {
           name: "Damola Ogundipe",
           role: "TCIA Board Member",
           bio: "",
           image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/3cde0916-f675-45a2-8d3f-4b14a90e04e2/Damola+Ogundipe.jpeg?content-type=image%2Fjpeg"
       }
   ];
   const cardSize = { width: 250, height: 350 };
   const cards = [];
   let isHovering = false;
   
   // Function to populate team members
   function populateTeamMembers() {
       const teamMembersContainer = document.getElementById('team-members');
       if (!teamMembersContainer) {
           console.error('Team members container not found');
           return;
       }

       // Always use horizontal scrolling layout
       teamMembersContainer.style.display = 'flex';
       teamMembersContainer.style.overflowX = 'auto';
       teamMembersContainer.style.scrollSnapType = 'x mandatory';
       teamMembersContainer.style.scrollBehavior = 'smooth';
       teamMembersContainer.style.WebkitOverflowScrolling = 'touch';
       teamMembersContainer.style.padding = '20px';
       teamMembersContainer.style.gap = '20px';
       teamMembersContainer.style.height = 'auto';
       teamMembersContainer.style.position = 'relative';

       teamMembers.forEach((member, index) => {
           const memberElement = document.createElement('div');
           memberElement.classList.add('team-member-card');
           
           if (member.role.includes("Board Member")) {
               memberElement.classList.add('board-member');
           }

           // Use static positioning for all devices
           memberElement.style.position = 'relative';
           memberElement.style.flex = '0 0 auto';
           memberElement.style.scrollSnapAlign = 'center';
           memberElement.style.transform = 'none';
           memberElement.style.left = 'auto';
           memberElement.style.top = 'auto';
           
           memberElement.innerHTML = `
               <div class="card-inner">
                   <div class="card-front">
                       <img src="${member.image}" alt="${member.name}" class="member-image" loading="lazy">
                       <div class="member-name">${member.name}</div>
                   </div>
                   <div class="card-back">
                       <h3 class="member-role">${member.role}</h3>
                       <p>Click for more info</p>
                   </div>
               </div>
           `;
           teamMembersContainer.appendChild(memberElement);
       });

       // UPDATED EVENT HANDLERS - Fix for Chromium
       // Remove the capture phase (true) parameter and modify event handlers
       teamMembersContainer.addEventListener('mouseenter', (event) => {
           if (event.target.closest('.team-member-card')) {
               event.target.closest('.team-member-card').classList.add('glow');
           }
       });

       teamMembersContainer.addEventListener('mouseleave', (event) => {
           if (event.target.closest('.team-member-card')) {
               event.target.closest('.team-member-card').classList.remove('glow');
           }
       });

       // Improved click handler to work across browsers
       teamMembersContainer.addEventListener('click', (event) => {
           // Find the closest card-back OR card-inner element to support clicks on various elements
           const cardElement = event.target.closest('.card-back') || event.target.closest('.card-inner');
           if (cardElement) {
               // Do NOT use stopPropagation() as it causes issues in Chromium
               // event.preventDefault(); - Remove this too if still having issues
               
               const memberCard = event.target.closest('.team-member-card');
               if (memberCard) {
                   const memberIndex = Array.from(teamMembersContainer.children).indexOf(memberCard);
                   if (memberIndex >= 0 && memberIndex < teamMembers.length) {
                       showMemberPopup(teamMembers[memberIndex]);
                   }
               }
           }
       });
   }
   
   function showMemberPopup(member) {
       const popup = document.getElementById('member-popup');
       const popupContent = popup.querySelector('.popup-content');
       const popupImage = popup.querySelector('.popup-image');
       const popupName = popup.querySelector('.popup-name');
       const popupCodename = popup.querySelector('.popup-codename');
       const popupRole = popup.querySelector('.popup-role');
       const popupSpecialty = popup.querySelector('.popup-specialty');
       const popupBio = popup.querySelector('.popup-bio');
       const popupBioContainer = popup.querySelector('.popup-bio-container');

       popupImage.src = member.image;
       popupName.textContent = member.name;
       popupCodename.textContent = member.codename || 'N/A';
       popupRole.textContent = member.role;
       popupSpecialty.textContent = member.specialty || 'N/A';
       
       if (member.bio && member.bio.trim() !== '') {
           popupBio.innerHTML = member.bio.split('\n').map(paragraph => {
               if (paragraph.trim() === '') return '';
               const firstLetter = paragraph.charAt(0);
               const restOfParagraph = paragraph.slice(1);
               return `<p><span class="drop-cap">${firstLetter}</span>${restOfParagraph}</p>`;
           }).join('');
           popupBioContainer.style.display = 'block';
       } else {
           popupBioContainer.style.display = 'none';
       }

       popup.style.display = 'flex';
       void popup.offsetWidth;
       popup.classList.add('show');
   }
   
   function closeMemberPopup() {
       const popup = document.getElementById('member-popup');
       popup.classList.remove('show');
       setTimeout(() => {
           popup.style.display = 'none';
       }, 300);
   }
   
   // Simplified animation function
   function animateElement(element, delay = 0) {
       gsap.fromTo(element, 
           { opacity: 0, y: 20 },
           { opacity: 1, y: 0, duration: 0.5, delay: delay, ease: "power2.out" }
       );
   }
   
   // Set up Intersection Observer for elements
   const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
           if (entry.isIntersecting) {
               animateElement(entry.target);
               observer.unobserve(entry.target);
           }
       });
   }, {
       threshold: 0.2
   });
   
   // Content data
   const pageContent = {
       mainTitle: "ABOUT TCIA",
       whoWeAreTitle: "Who We Are",
       whoWeAreStatement: "The Twin Cities Innovation Alliance (TCIA) is a social venture, intended to spark, resource, and guide entrepreneurs as they grow and scale their businesses across the Twin Cities, operating out of the need for greater diversity, inclusion and equity in technology and entrepreneurship. After 15 years of self funded initiatives from programing and volunteering in Saint Paul we launched TCIA with initial seed investment from the Knight Foundation.",
       whoWeAreStatement2: "Twin Cities Innovation Alliance (TCIA) is a coalition of stakeholders representing a cross sector of public, private and community organizations, corporations and institutions led by visionaries, academics, thought leaders and individuals who are invested in the Twin Cities' continued evolution as a forward‐thinking, innovative, 'Smart' global city.",
       missionTitle: "Mission",
       missionStatement: "Our mission is to build and develop a critical mass of diverse, highly-engaged residents, policy makers, and entrepreneurs, made up of minorities and people of color traditionally identified as the end users and consumers of innovation and design, and transforming them into the purveyors and beneficiaries. This will benefit all communities across the nation and our world. We exchange learnings while adapting and evolving our collective work.",
       orgQuoteText: "\"Data is the oxygen that fuels SMART Cities and Connected Communities\"",
       orgQuoteAuthor: "- Aasim Shabazz",
       teamHeading: "Welcome To Our Universe"
   };
   
   // Function to insert content
   function insertContent() {
       document.getElementById('main-title').textContent = pageContent.mainTitle;
       document.getElementById('who-we-are-title').textContent = pageContent.whoWeAreTitle;
       document.getElementById('who-we-are-statement').textContent = pageContent.whoWeAreStatement;
       document.getElementById('who-we-are-statement-2').textContent = pageContent.whoWeAreStatement2;
       document.getElementById('mission-title').textContent = pageContent.missionTitle;
       document.getElementById('mission-statement').textContent = pageContent.missionStatement;
       document.getElementById('org-quote-text').textContent = pageContent.orgQuoteText;
       document.getElementById('org-quote-author').textContent = pageContent.orgQuoteAuthor;
       document.getElementById('team-heading').textContent = pageContent.teamHeading;
   }
   
   // Function to setup nav buttons
   function setupNavButtons() {
       const navButtons = document.querySelectorAll('.nav-button');
       navButtons.forEach(button => {
           button.addEventListener('click', () => {
               const sectionId = button.getAttribute('data-section');
               const section = document.getElementById(sectionId);
               if (section) {
                   section.scrollIntoView({ behavior: 'smooth' });
                   document.getElementById('nav-overlay').classList.remove('show');
               }
           });
       });
   }
   
   // Make sure your event listeners and DOM handlers only get attached once
   if (!window.tciaEventListenersAttached) {
       window.tciaEventListenersAttached = true;
       
       // Move your document.addEventListener('DOMContentLoaded', ...) logic here
       document.addEventListener('DOMContentLoaded', () => {
           // Insert content
           insertContent();
           
           // Setup navigation
           setupNavButtons();
           
           // Create pillars if not on mobile
           if (!isMobile) {
               createPillars();
           }
           
           // Populate team members
           populateTeamMembers();
           
           // Setup popup close handlers
           document.addEventListener('click', (event) => {
               if (event.target.classList.contains('close') || 
                   event.target === document.getElementById('member-popup')) {
                   closeMemberPopup();
               }
           });
           
           document.querySelector('.popup-content').addEventListener('click', (event) => {
               event.stopPropagation();
           });
           
           document.querySelector('.close').addEventListener('click', closeMemberPopup);
           
           // Observe elements for animation
           const elementsToAnimate = [
               '#who-we-are-title',
               '#who-we-are-statement',
               '#who-we-are-statement-2',
               '#mission-title',
               '#mission-statement',
               '#org-quote',
               '#team-heading'
           ];
           
           elementsToAnimate.forEach(selector => {
               const element = document.querySelector(selector);
               if (element) {
                   gsap.set(element, { opacity: 0 });
                   observer.observe(element);
               }
           });
           
           // Simple fade-in for main title
           gsap.to("#main-title", { opacity: 1, duration: 0.8 });
       });
   }
   
   // TCIA colors
   const tciaColors = [
       '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'
   ];
   
   // Organization pillars
   const orgPillars = [
       "People (Human Centered) & Education",
       "Climate Change (Energy) & Technology",
       "Governance (Democracy Centered) & Infrastructure",
       "Building (Architectural Insight) & Health"
   ];
   
   function createPillars() {
       const orbitElement = document.getElementById('org-pillars');
       if (!orbitElement) return;
       
       const totalPillars = orgPillars.length;
       const radius = 250;

       orgPillars.forEach((pillar, index) => {
           const pillarElement = document.createElement('div');
           pillarElement.classList.add('pillar');
           
           const pillarText = document.createElement('div');
           pillarText.classList.add('pillar-text');
           pillarText.textContent = pillar;
           
           pillarElement.appendChild(pillarText);

           const angle = (index / totalPillars) * 2 * Math.PI;
           const x = radius * Math.cos(angle);
           const y = radius * Math.sin(angle);

           pillarElement.style.left = `${x + 300}px`;
           pillarElement.style.top = `${y + 300}px`;
           pillarElement.style.transform = 'translate(-50%, -50%)';
           pillarElement.style.backgroundColor = tciaColors[index % tciaColors.length];

           orbitElement.appendChild(pillarElement);
       });
   }
}
