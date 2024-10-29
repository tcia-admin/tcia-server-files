
   
   // Add this to the top of your script, after importing Three.js
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

    
    // Modify the existing Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
        window.innerWidth / -2, window.innerWidth / 2, 
        window.innerHeight / 2, window.innerHeight / -2, 
        0.1, 1000
    );
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('star-background'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    //let starBackground = addStarBackground(scene, window.innerWidth, window.innerHeight);

    // Usage
    let starBackground = addStarBackground(scene, window.innerWidth, window.innerHeight, {
        twinkleInterval: 20, // Twinkle every 20 seconds
        twinkleDuration: 1 // Twinkle animation lasts 1 second
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    window.addEventListener('resize', debounce(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        // Recreate star background on resize
        scene.remove(starBackground);
        starBackground = addStarBackground(scene, width, height);
    }, 250));

    const isMobile = window.innerWidth <= 48 * 16; // 48rem

    // Team members data
    const teamMembers = [
        {
            name: "Aasim Shabazz",
            role: "Co-Founder & President",
            bio: "Aasim Shabazz is a vision-driven technologist, co-founder, and president of Twin Cities Innovation Alliance (TCIA). Aasim drives innovative solutions to complex problems faced by communities and organizations. Aasim serves as the architect of the TCIA’s annual Data 4 Public Good conference—a cultivated experience for meaningful contributions, co-powering, change-making, and relationship-building in digital justice. Throughout his career, Aasim has contributed leadership by serving on various boards and commissions, including advancing Minnesota equitable light rail development—where he served as a founding co-chair of the Blue Line Coalition. \nAasim is also lead innovator and steward leader of iAskc, a digital transformation company providing organizational agility solutions for enterprises across the globe. Aasim brings his experience as a visionary thought leader and certified Scaled Agile® Program Consultant Expert Agile, to support organizations in improving their value delivery from a people-focused approach. Aasim effectively leverages his experience of 20+ years of working in the areas of Agile teams, Design Thinking, Lean Practices, SAFe Transformation, Change Management, Strategic Planning, Organizational Design, and Human Resource Strategy.",
            image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/47442c50-0cbf-4ca3-8502-1a4dd9c490f8/Aasim+Shabazz_+headshot+1.png?content-type=image%2Fpng"
        },
       /*
        {
            name: "Yashada Nikam",
            role: "Data Scientist",
            bio: "Yashada Nikam holds a Master's Degree in Data Science and works as a Data Scientist at Twin Cities Innovation Alliance. \n With a curious and analytical mindset, she is adept at diving deep into diverse datasets, asking insightful questions, and presenting compelling narratives through data visualization, making it accessible and relatable. \n When she’s not glued to her computer, Yashada loves to bake sugary goods, write prose poetry and time loses all its meaning once she picks up a book!",
            image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/d8d6ae52-2837-42f2-9ad2-7d4dec6d3c9d/Capture+d%E2%80%99e%CC%81cran+2024-10-18+a%CC%80+12.07.33%E2%80%AFPM.png?content-type=image%2Fpng"
        },
        */
        {
            name: "Khanh Tu",
            role: "Digital Marketer and Graphic Designer",
            bio: "Khanh Tu is a digital marketer and graphic designer who develops and executes effective digital marketing strategies for TCIA. She holds a Bachelor of Science in Marketing and is a self-taught graphic designer. Khanh creates visually compelling designs while ensuring brand consistency across TCIA’s platforms, enhancing its visual identity. \n In her free time, Khanh enjoys working on digital art and personal creative projects, including pen-palling, bullet journaling, and film photography.",
            image: "https://picsum.photos/id/1013/200/200"
        },
        {
            name: "Sudanna Morris",
            role: "Admin",
            bio: "Sudanna Morris is a Project Manager and Admin Coordinator at TCIA.  She manages different initiatives and special projects from planning to execution phase. This ensures that all projects and action items are delivered efficiently and are consistent with organizational goals. Outside of work, Sudanna unwinds by watching drama, comedy, and action movies and spend quality time with family and friends.",
            image: "https://images.squarespace-cdn.com/content/5b9081c58ab7224793278e1d/b05be2d7-86a4-448c-bc5a-f974f6ac2105/Sudanna.png?content-type=image%2Fpng"
        },
       /*
        {
            name: "Jadyn Mardy",
            role: "Digital Marketer and Video Editor",
            bio: "Jadyn is a marketing coordinator and video editor for TCIA and has been thrilled to be a part of the team for over a year. Jadyn is a senior double majoring in Child Studies and Film and Media studies and largely manages TCIA’s social media and communication presents and edits all video content. Along with a love for storytelling through visual media, she loves writing about aspects of data justice, AI use and summarizing reports that explore the same. \n Originally from NY, Jadyn is currently a Bostonian impersonator who loves to rollerblade, watch movies and stay up late writing.",
            image: "https://picsum.photos/id/1015/200/200"
        },
        */
        {
            name: "Marika Pfefferkorn",
            role: "Co-founder Twin Cities Innovation Alliance (TCIA) & Executive Director, Midwest Center for School Transformation (MCST)",
            bio: "As an interdisciplinary and cross-sector thought leader and community advocate Marika Pfefferkorn is a change agent working to transform educational ecosystems and scale successes. Ms. Pfefferkorn’s work begins in community and arcs to the regional and national scope. Her experience covers policy, leadership, research, community building, and engagement. She integrates cultural wisdom, and the arts and applies a restorative lens to upend punitive conditions in education and society, leading with a vision for collective liberation and self-determination. \n In an effort, to disrupt the Cradle to Prison Algorithm (an expansion of the School to Prison Pipeline/ School and Prison Nexus), Ms. Pfefferkorn teaches, trains, and coaches’ youth, families, and systems on youth data criminalization at the intersection of education and technology. She co-powers with a diversity of communities to center data justice through projects and programming like the No Data About Us Without Us Fellowship and Digital Justice Ideathon. Ms. Pfefferkorn’s work demonstrates an agile approach to community engagement, meeting people and systems where they are to educate, equip and activate solutions that reflect and benefit communities. \n She has successfully co-led campaigns to end discriminatory suspension practices in Minnesota schools, to remove the presence of police in Minneapolis and St. Paul schools, to increase investment in indigenous restorative practices in education. She co-developed and co-teaches Carcerality and Education at Carleton College.  \n She is a can organizing member of Education for Liberation Minnesota Chapter, a founding member of the Racial Justice S.T. E. A.M. Collective and co-founder of the No Tech Criminalization in Education (NOTICE) Coalition, and the Stop the Cradle to Prison Algorithm Coalition.",
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

    function populateTeamMembers() {
        const teamMembersContainer = document.getElementById('team-members');
        if (!teamMembersContainer) {
            console.error('Team members container not found');
            return;
        }
        console.log('Populating team members');

        const containerRect = teamMembersContainer.getBoundingClientRect();

        teamMembers.forEach((member, index) => {
            const memberElement = document.createElement('div');
            memberElement.classList.add('team-member-card');
            
            // Add 'board-member' class if the role is "TCIA Board Member"
            if (member.role === "TCIA Board Member") {
                memberElement.classList.add('board-member');
            }
            
            memberElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="${member.image}" alt="${member.name}" class="member-image">
                        <div class="member-name">${member.name}</div>
                    </div>
                    <div class="card-back">
                        <h3 class="member-role">${member.role}</h3>
                        <p>Click for more info</p>
                    </div>
                </div>
            `;
            teamMembersContainer.appendChild(memberElement);
            console.log(`Added team member ${index + 1}: ${member.name}`);

            if (!isMobile) {
                let position;
                do {
                    position = getRandomPosition(containerRect);
                } while (isOverlapping(position, cards));

                memberElement.style.left = `${position.x}px`;
                memberElement.style.top = `${position.y}px`;

                const card = {
                    element: memberElement,
                    x: position.x,
                    y: position.y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                };

                cards.push(card);
            }
        });

        // Event delegation for hover and click events
        teamMembersContainer.addEventListener('mouseenter', (event) => {
            if (event.target.closest('.team-member-card')) {
                isHovering = true;
                event.target.closest('.team-member-card').classList.add('glow');
            }
        }, true);

        teamMembersContainer.addEventListener('mouseleave', (event) => {
            if (event.target.closest('.team-member-card')) {
                isHovering = false;
                event.target.closest('.team-member-card').classList.remove('glow');
            }
        }, true);

        teamMembersContainer.addEventListener('click', (event) => {
            const cardBack = event.target.closest('.card-back');
            if (cardBack) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Card back clicked');
                const memberIndex = Array.from(teamMembersContainer.children).indexOf(cardBack.closest('.team-member-card'));
                showMemberPopup(teamMembers[memberIndex]);
            }
        });
        if (!isMobile) {
            requestAnimationFrame(animateCards);
        }
    }

    function getRandomPosition(containerRect) {
        const x = Math.random() * (containerRect.width - cardSize.width);
        const y = Math.random() * (containerRect.height - cardSize.height);
        return { x, y };
    }

    function isOverlapping(position, existingCards) {
        return existingCards.some(card => 
            position.x < card.x + cardSize.width &&
            position.x + cardSize.width > card.x &&
            position.y < card.y + cardSize.height &&
            position.y + cardSize.height > card.y
        );
    }

    function animateCards() {
        const containerRect = document.getElementById('team-members').getBoundingClientRect();

        if (!isHovering) {
            cards.forEach(card => {
                // Update position
                card.x += card.vx;
                card.y += card.vy;

                // Bounce off walls
                if (card.x <= 0 || card.x + cardSize.width >= containerRect.width) {
                    card.vx *= -1;
                }
                if (card.y <= 0 || card.y + cardSize.height >= containerRect.height) {
                    card.vy *= -1;
                }

                // Check collisions with other cards
                cards.forEach(otherCard => {
                    if (card !== otherCard) {
                        if (isColliding(card, otherCard)) {
                            // Simple collision response
                            const tempVx = card.vx;
                            const tempVy = card.vy;
                            card.vx = otherCard.vx;
                            card.vy = otherCard.vy;
                            otherCard.vx = tempVx;
                            otherCard.vy = tempVy;
                        }
                    }
                });

                // Update card position
                card.element.style.left = `${card.x}px`;
                card.element.style.top = `${card.y}px`;
            });
        }

        requestAnimationFrame(animateCards);
    }

    function isColliding(card1, card2) {
        return card1.x < card2.x + cardSize.width &&
               card1.x + cardSize.width > card2.x &&
               card1.y < card2.y + cardSize.height &&
               card1.y + cardSize.height > card2.y;
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
            // Support for multiple paragraphs in bio with drop caps
            popupBio.innerHTML = member.bio.split('\n').map(paragraph => {
                if (paragraph.trim() === '') return ''; // Skip empty paragraphs
                const firstLetter = paragraph.charAt(0);
                const restOfParagraph = paragraph.slice(1);
                return `<p><span class="drop-cap">${firstLetter}</span>${restOfParagraph}</p>`;
            }).join('');
            popupBioContainer.style.display = 'block';
        } else {
            popupBioContainer.style.display = 'none';
        }

        // Show the popup
        popup.style.display = 'flex';
        // Trigger reflow
        void popup.offsetWidth;
        popup.classList.add('show');
    }

    // Function to close the popup
    function closeMemberPopup() {
        const popup = document.getElementById('member-popup');
        popup.classList.remove('show');
        // Wait for the transition to finish before hiding the popup
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300); // This should match the transition duration
    }

    // Use event delegation for closing popup
    document.addEventListener('click', (event) => {
        const popup = document.getElementById('member-popup');
        if (event.target.classList.contains('close') || event.target === popup) {
            closeMemberPopup();
        }
    });

    // Prevent closing when clicking inside the popup content
    document.querySelector('.popup-content').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // Add this new event listener for the close button
    document.querySelector('.close').addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMemberPopup();
    });

    // Function to animate elements
    function animateElement(element, delay = 0) {
        gsap.fromTo(element, 
            {
                opacity: 0,
                y: 50,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.75,
                delay: delay,
                ease: "power3.out",
            }
        );
    }

    // Set up Intersection Observer for all elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.classList.contains('team-member')) {
                    const index = Array.from(element.parentNode.children).indexOf(element);
                    animateTeamMember(element, index);
                } else {
                    animateElement(element);
                }
                observer.unobserve(element); // Stop observing after animation
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.8 // Trigger when 80% of the element is visible
    });

    // Observe each element
    const elementsToAnimate = [
        '#who-we-are-title',
        '#who-we-are-statement',
        '#who-we-are-statement-2',
        '#mission-title',
        '#mission-statement',
        '#org-quote',
        '#org-pillars',
        '#team-heading'
    ];

    elementsToAnimate.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            gsap.set(element, { opacity: 0, visibility: 'visible' });
            observer.observe(element);
        }
    });

    // Observe team members
    document.querySelectorAll('.team-member').forEach((element) => {
        gsap.set(element, { opacity: 0, visibility: 'visible' });
        observer.observe(element);
    });

    // Animations for titles and statements
    gsap.to("#main-title", { opacity: 1, duration: 1, delay: 0.8 });

    // Function to animate team member
    function animateTeamMember(element, index) {
        gsap.fromTo(element, 
            {
                opacity: 0,
                x: index % 2 === 0 ? '200%' : '-200%',
                scale: 0.1,
            },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.75,
                ease: "power3.out",
            }
        );
    }

    // Function to toggle nav overlay
    function toggleNavOverlay() {
        const navOverlay = document.getElementById('nav-overlay');
        if (navOverlay) {
            navOverlay.classList.toggle('show');
            adjustNavButtonWidth();
        }
    }

    function adjustNavButtonWidth() {
        const navOverlay = document.getElementById('nav-overlay');
        const navButtons = document.querySelectorAll('.nav-button');
        const isShown = navOverlay.classList.contains('show');
        
        navButtons.forEach(button => {
            if (isShown) {
                button.style.width = '100%';
                button.style.fontSize = 'inherit';
            } else {
                button.style.width = '40px'; // Adjust this value as needed
                button.style.fontSize = '0';
            }
        });
    }

    // Call adjustNavButtonWidth on page load
    document.addEventListener('DOMContentLoaded', adjustNavButtonWidth);

    // Function to scroll to a section
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            toggleNavOverlay(); // Close the nav overlay after clicking a button
        }
    }

    // Function to setup nav buttons
    function setupNavButtons() {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                console.log(`Nav button clicked: ${sectionId}`);
                scrollToSection(sectionId);
            });
        });
    }


    // Call setup functions after the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded');
        
        setupNavButtons();
        
        console.log('Toggle nav button:', document.getElementById('toggle-nav'));
        populateTeamMembers();
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

    // Call the function to insert content
    insertContent();

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
        const totalPillars = orgPillars.length;
        const radius = 250; // Adjust this value to change the circle size

        orgPillars.forEach((pillar, index) => {
            const pillarElement = document.createElement('div');
            pillarElement.classList.add('pillar');
            
            const pillarText = document.createElement('div');
            pillarText.classList.add('pillar-text');
            pillarText.textContent = pillar;
            
            pillarElement.appendChild(pillarText);

            // Position the pillar
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

    // Call the function to create pillars
    createPillars();
