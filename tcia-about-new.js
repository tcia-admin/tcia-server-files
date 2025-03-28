// Add this check at the start of your file to prevent duplicate initialization
if (window.tciaInitialized) {
    console.log('TCIA script already initialized, skipping');
} else {
    window.tciaInitialized = true;
    
    // Replace THREE.js implementation with vanilla canvas implementation
    const setupStarBackground = () => {
        // Get the canvas
        const canvas = document.getElementById('star-background');
        if (!canvas) return;
        
        // Make sure the canvas is visible
        canvas.style.display = 'block';
        
        // Limit the canvas to only cover the about-page section
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        
        // This is the key change - make the canvas only appear within the about-page section
        const aboutPage = document.getElementById('about-page');
        if (aboutPage) {
            aboutPage.style.position = 'relative'; // Ensure the section creates a stacking context
            aboutPage.style.zIndex = '0'; // Ensure positive z-index
            
            // Add a listener to hide canvas when scrolled past the about section
            window.addEventListener('scroll', () => {
                const aboutRect = aboutPage.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Calculate how much of the about page is still visible
                const visibleHeight = Math.min(windowHeight, aboutRect.bottom) - Math.max(0, aboutRect.top);
                const visibilityRatio = visibleHeight / windowHeight;
                
                // If we've scrolled completely past the about section, hide the canvas
                if (aboutRect.bottom <= 0 || aboutRect.top >= windowHeight) {
                    canvas.style.opacity = '0';
                    canvas.style.pointerEvents = 'none'; // Disable pointer events
                } 
                // If we're at the end of the about section, start fading out
                else if (aboutRect.bottom < windowHeight) {
                    // Calculate a fade out effect as we approach the end
                    const fadeRatio = aboutRect.bottom / windowHeight;
                    canvas.style.opacity = fadeRatio.toString();
                    
                    // When we're close to the footer (less than 30% of the screen showing about page)
                    // disable pointer events to allow clicking on footer links
                    if (fadeRatio < 0.3) {
                        canvas.style.pointerEvents = 'none';
                    } else {
                        canvas.style.pointerEvents = 'auto';
                    }
                } 
                // Otherwise show it fully
                else {
                    canvas.style.opacity = '1';
                    canvas.style.pointerEvents = 'auto';
                }

                // Add this inside the scroll event listener
                const footer = document.querySelector('footer'); 
                if (footer) {
                    const footerRect = footer.getBoundingClientRect();
                    // If footer is visible at all, disable pointer events on canvas
                    if (footerRect.top < windowHeight) {
                        canvas.style.pointerEvents = 'none';
                    }
                }
            });
        }
        
        // Set proper size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Create stars
        const stars = [];
        const starCount = Math.min(window.innerWidth * window.innerHeight / 3000, 300);
        
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.05 + 0.01
            });
        }
        
        // Animation function
        function animateStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();
                
                // Move star (simple parallax effect)
                star.y += star.speed;
                
                // Reset if off screen
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });
            
            requestAnimationFrame(animateStars);
        }
        
        // Start animation
        animateStars();
        
        // Handle resize with debouncing to prevent performance issues
        const resizeDebounce = debounce(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Redistribute stars on resize
            stars.forEach(star => {
                star.x = Math.random() * canvas.width;
                star.y = Math.random() * canvas.height;
            });
        }, 250);
        
        window.addEventListener('resize', resizeDebounce);
        
        // Trigger the scroll handler immediately to set initial state
        window.dispatchEvent(new Event('scroll'));
    };
    
    // Utility function for debouncing that we'll use for resize
   const debounce = (func, delay) => {
       let timeoutId;
       return (...args) => {
           clearTimeout(timeoutId);
           timeoutId = setTimeout(() => func(...args), delay);
       };
   };
   
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
           
            // Create a simpler card structure
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.innerHTML = `
                       <img src="${member.image}" alt="${member.name}" class="member-image" loading="lazy">
                       <div class="member-name">${member.name}</div>
            `;
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.setAttribute('data-index', index);
            cardBack.innerHTML = `
                       <h3 class="member-role">${member.role}</h3>
                       <p>Click for more info</p>
            `;
            
            // Add the direct click handler here - before adding to DOM
            cardBack.onclick = function(e) {
                console.log('Card back clicked:', index);
                showMemberPopup(teamMembers[index]);
                e.stopPropagation();
            };
            
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            memberElement.appendChild(cardInner);
            
           teamMembersContainer.appendChild(memberElement);
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
        
   document.addEventListener('DOMContentLoaded', () => {
            // Setup the star background first
            setupStarBackground();
            
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
