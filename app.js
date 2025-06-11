/********************************************
 * COMPLETE AUTOMATAR APPLICATION
 * Fixed and Enhanced JavaScript
 ********************************************/

/********************************************
 * APPLE-STYLE ASSEMBLY/DISASSEMBLY ANIMATIONS
 ********************************************/

// Assembly animation system
let assemblyObserver;
let assemblyElements = [];
let currentAssembledSection = -1;

// Initialize Apple-style assembly animations
function initAssemblyAnimations() {
  // Get all kit sections for assembly animation
  assemblyElements = Array.from(document.querySelectorAll('.kit-section')).map((section, index) => {
    const kitText = section.querySelector('.kit-text');
    const kitImage = section.querySelector('.kit-image');
    
    return {
      section,
      kitText,
      kitImage,
      index,
      isAssembled: false,
      lastRatio: 0
    };
  });

  // Create intersection observer for assembly detection
  assemblyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sectionIndex = assemblyElements.findIndex(el => el.section === entry.target);
      if (sectionIndex === -1) return;

      const element = assemblyElements[sectionIndex];
      const ratio = entry.intersectionRatio;
      element.lastRatio = ratio;

      // Determine assembly state based on scroll position
      if (ratio > 0.3 && ratio < 0.7) {
        // Sweet spot - fully assemble
        assembleSection(element, sectionIndex);
      } else if (ratio >= 0.1 && ratio <= 0.3) {
        // Entering viewport - start assembly
        if (!element.isAssembled) {
          assembleSection(element, sectionIndex);
        }
      } else if (ratio < 0.1 || ratio > 0.9) {
        // Leaving viewport - disassemble
        disassembleSection(element, sectionIndex);
      }
    });

    // Handle section transitions
    updateSectionTransitions();
  }, {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    rootMargin: '0px'
  });

  // Observe all kit sections
  assemblyElements.forEach(element => {
    assemblyObserver.observe(element.section);
  });

  // Add parallax scrolling for assembled elements
  window.addEventListener('scroll', handleAssemblyParallax, { passive: true });
}

function assembleSection(element, index) {
  if (element.isAssembled) return;
  
  element.isAssembled = true;
  currentAssembledSection = index;

  // Remove pre-assembly and disassembled classes
  element.kitText.classList.remove('pre-assembly', 'disassembled');
  element.kitImage.classList.remove('pre-assembly', 'disassembled');

  // Add assembled class with staggered timing
  setTimeout(() => {
    element.kitText.classList.add('assembled');
  }, 100);

  setTimeout(() => {
    element.kitImage.classList.add('assembled');
  }, 300);

  // Trigger video play if not playing
  const video = element.kitImage.querySelector('.kit-video');
  if (video && video.paused && video.readyState >= 2) {
    video.play().catch(e => console.warn('Video play failed:', e));
  }
}

function disassembleSection(element, index) {
  if (!element.isAssembled) return;
  
  element.isAssembled = false;
  
  // Remove assembled class
  element.kitText.classList.remove('assembled');
  element.kitImage.classList.remove('assembled');

  // Add disassembled class with staggered timing
  setTimeout(() => {
    element.kitText.classList.add('disassembled');
  }, 50);

  setTimeout(() => {
    element.kitImage.classList.add('disassembled');
  }, 150);

  // After disassembly animation, reset to pre-assembly
  setTimeout(() => {
    element.kitText.classList.remove('disassembled');
    element.kitImage.classList.remove('disassembled');
    element.kitText.classList.add('pre-assembly');
    element.kitImage.classList.add('pre-assembly');
  }, 800);

  // Pause video to save resources
  const video = element.kitImage.querySelector('.kit-video');
  if (video && !video.paused) {
    video.pause();
  }
}

function updateSectionTransitions() {
  // Find the most visible section
  let mostVisibleSection = -1;
  let highestRatio = 0;

  assemblyElements.forEach((element, index) => {
    if (element.lastRatio > highestRatio && element.lastRatio > 0.2) {
      highestRatio = element.lastRatio;
      mostVisibleSection = index;
    }
  });

  // Update current assembled section
  if (mostVisibleSection !== -1 && mostVisibleSection !== currentAssembledSection) {
    // Disassemble previous section
    if (currentAssembledSection >= 0 && currentAssembledSection < assemblyElements.length) {
      const prevElement = assemblyElements[currentAssembledSection];
      if (Math.abs(currentAssembledSection - mostVisibleSection) > 1) {
        disassembleSection(prevElement, currentAssembledSection);
      }
    }
  }
}

// Enhanced parallax for assembled elements
function handleAssemblyParallax() {
  const scrolled = window.pageYOffset;
  
  // Background parallax
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    const rate = scrolled * -0.2;
    parallaxBg.style.transform = `translate3d(0, ${rate}px, 0)`;
  }

  // Individual element parallax for assembled sections
  assemblyElements.forEach((element, index) => {
    if (element.isAssembled && element.lastRatio > 0.3) {
      const rect = element.section.getBoundingClientRect();
      const speed = (index % 2 === 0) ? 0.1 : -0.1;
      const yPos = rect.top * speed;
      
      // Apply subtle parallax to assembled elements
      if (element.kitImage && rect.top < window.innerHeight && rect.bottom > 0) {
        const currentTransform = element.kitImage.style.transform || '';
        if (!currentTransform.includes('translateX') || element.kitImage.classList.contains('assembled')) {
          element.kitImage.style.transform = `translateZ(0) translateY(${yPos}px)`;
        }
      }
    }
  });
}

// Smooth section-by-section scrolling
function initSectionScrolling() {
  const sections = document.querySelectorAll('.kit-section, .intro-section');
  let isScrolling = false;
  let currentSectionIndex = 0;

  function scrollToSection(index) {
    if (index >= 0 && index < sections.length && !isScrolling) {
      isScrolling = true;
      sections[index].scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      setTimeout(() => {
        isScrolling = false;
      }, 1200);
    }
  }

  // Enhanced wheel event for section navigation
  let wheelTimeout;
  window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      const delta = e.deltaY;
      if (Math.abs(delta) > 100) {
        if (delta > 0 && currentSectionIndex < sections.length - 1) {
          currentSectionIndex++;
          scrollToSection(currentSectionIndex);
        } else if (delta < 0 && currentSectionIndex > 0) {
          currentSectionIndex--;
          scrollToSection(currentSectionIndex);
        }
      }
    }, 50);
  }, { passive: true });

  // Touch support for mobile section navigation
  let touchStartY = 0;
  let touchEndY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 100 && !isScrolling) {
      if (diff > 0 && currentSectionIndex < sections.length - 1) {
        currentSectionIndex++;
        scrollToSection(currentSectionIndex);
      } else if (diff < 0 && currentSectionIndex > 0) {
        currentSectionIndex--;
        scrollToSection(currentSectionIndex);
      }
    }
  }, { passive: true });

  // Update current section based on scroll position
  window.addEventListener('scroll', () => {
    if (isScrolling) return;
    
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;
      
      if (scrollTop >= sectionTop - windowHeight / 2 && scrollTop < sectionBottom - windowHeight / 2) {
        currentSectionIndex = index;
      }
    });
  }, { passive: true });
}

// Initialize all assembly animations
function initScrollAnimations() {
  initAssemblyAnimations();
  initSectionScrolling();
  
  // Add subtle initial animations to intro section
  const introTitle = document.querySelector('.intro-section h2');
  const introText = document.querySelector('.intro-section p');
  
  if (introTitle && introText) {
    introTitle.style.opacity = '0';
    introText.style.opacity = '0';
    introTitle.style.transform = 'translateY(50px)';
    introText.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      introTitle.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.32, 1)';
      introText.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.32, 1) 0.3s';
      introTitle.style.opacity = '1';
      introTitle.style.transform = 'translateY(0)';
    }, 500);
    
    setTimeout(() => {
      introText.style.opacity = '1';
      introText.style.transform = 'translateY(0)';
    }, 800);
  }
}

/********************************************
 * VIDEO OPTIMIZATION FUNCTIONS
 ********************************************/

function initVideoOptimization() {
  // Optimize video playback for performance
  const videos = document.querySelectorAll('.kit-video, .kit-detail-video');
  
  videos.forEach(video => {
    // Set loading attribute for better performance
    video.setAttribute('loading', 'lazy');
    
    // Handle video loading states
    video.addEventListener('loadstart', function() {
      this.setAttribute('data-loading', 'true');
    });
    
    video.addEventListener('canplay', function() {
      this.removeAttribute('data-loading');
    });
    
    // Handle video errors gracefully
    video.addEventListener('error', function() {
      console.warn('Video failed to load:', this.src);
      this.style.display = 'none';
      const placeholder = this.nextElementSibling;
      if (placeholder && placeholder.classList.contains('placeholder-img')) {
        placeholder.style.display = 'block';
      }
    });
  });
  
  // Intersection Observer for video playback optimization
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        // Video is visible, ensure it's playing
        if (video.paused && video.readyState >= 2) {
          video.play().catch(e => {
            console.warn('Video autoplay failed:', e);
          });
        }
      } else {
        // Video is not visible, pause to save resources
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  // Observe all kit videos
  const kitVideos = document.querySelectorAll('.kit-video');
  kitVideos.forEach(video => {
    videoObserver.observe(video);
  });
}

function pauseAllVideos() {
  const videos = document.querySelectorAll('.kit-video, .kit-detail-video');
  videos.forEach(video => {
    if (!video.paused) {
      video.pause();
    }
  });
}

function resumeVisibleVideos() {
  const videos = document.querySelectorAll('.kit-video');
  videos.forEach(video => {
    const rect = video.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible && video.paused && video.readyState >= 2) {
      video.play().catch(e => {
        console.warn('Video resume failed:', e);
      });
    }
  });
}

/********************************************
 * AI INTERFACE FUNCTIONALITY
 ********************************************/

// AI Screen data structure
const aiScreenData = {
  models: {
    'cam-a-model': 'Cam-A 3D Model: High-resolution STL model of the cam mechanism. This model demonstrates how cams convert rotational motion into linear oscillatory motion using contoured surfaces. The cam\'s rotating surface drives the follower in precise, complex patterns. Perfect for 3D printing and CAD analysis.',
    'cam-c-model': 'Cam-C 3D Model: Geneva wheel mechanism model showcasing intermittent motion principles. Features both the drive wheel with pin and the indexed Geneva wheel with slots. This model illustrates how continuous rotation creates precise, timed intermittent motion.',
    'crank-model': 'Crank 3D Model: Complete crank mechanism with connecting rod and slider components. Demonstrates the conversion of rotational motion into linear reciprocating motion through the crank-slider mechanism used in engines and pumps.',
    'gear-a-model': 'Gear-A 3D Model: Precision bevel gear set demonstrating 90-degree power transmission. Features cone-shaped teeth that meet at right angles, showing how rotational motion can be redirected while maintaining efficient power transfer.',
    'gear-b-model': 'Gear-B 3D Model: Variable speed gear system showcasing dynamic torque distribution. This model demonstrates how gear alignment and shape can create non-uniform motion and variable speed output from constant input.',
    'gear-c-model': 'Gear-C 3D Model: Worm gear assembly featuring self-locking mechanism and high torque multiplication. Shows the screw-like worm driving the worm wheel at 90 degrees with significant speed reduction and torque increase.'
  },
  kit1: {
    'cam-a-kit': 'Cam-A Kit: Learn rotational motion conversion through hands-on assembly. This kit includes all components needed to build a functional cam mechanism: the cam disc, follower, base plate, and mounting hardware. Students can observe how different cam profiles create various motion patterns.',
    'cam-c-kit': 'Cam-C Kit: Explore intermittent motion with the Geneva wheel mechanism. Kit contains the drive wheel with pin, Geneva wheel with precision-cut slots, timing guides, and assembly base. Perfect for understanding how continuous input creates stepped, controlled output motion.',
    'crank-kit': 'Crank Kit: Master reciprocating motion mechanics. Includes crank arm, connecting rod, slider mechanism, guide rails, and mounting base. Students can experiment with different crank lengths and observe how this affects stroke length and force characteristics.'
  },
  kit2: {
    'gear-a-kit': 'Gear-A Kit: Understand perpendicular power transmission with bevel gears. Contains matched pair of bevel gears, right-angle mounting frame, input and output shafts, and bearings. Demonstrates efficient 90-degree power redirection used in automotive differentials.',
    'gear-b-kit': 'Gear-B Kit: Explore variable speed transmission systems. Features specially designed gear sets with non-circular profiles, adjustable mounting system, and measurement tools. Shows how gear geometry affects speed variation and torque characteristics.',
    'gear-c-kit': 'Gear-C Kit: Experience worm gear systems and their unique properties. Includes precision worm screw, worm wheel, self-locking demonstration setup, and torque measurement tools. Perfect for understanding high reduction ratios and irreversible motion transmission.'
  }
};

// Initialize AI Screen
function initializeAIScreen() {
  // Set up dropdown event listeners
  const modelDropdown = document.getElementById('aiModelDropdown');
  const kit1Dropdown = document.getElementById('aiKit1Dropdown');
  const kit2Dropdown = document.getElementById('aiKit2Dropdown');
  
  if (modelDropdown) {
    modelDropdown.addEventListener('change', handleAIDropdownChange);
  }
  if (kit1Dropdown) {
    kit1Dropdown.addEventListener('change', handleAIDropdownChange);
  }
  if (kit2Dropdown) {
    kit2Dropdown.addEventListener('change', handleAIDropdownChange);
  }
  
  // Set initial content
  updateAITextContent();
}

// Handle dropdown changes
function handleAIDropdownChange(event) {
  updateAITextContent();
  
  // Add visual feedback
  const card = event.target.closest('.ai-card');
  if (card) {
    card.style.transform = 'scale(1.02)';
    setTimeout(() => {
      card.style.transform = '';
    }, 200);
  }
}

// Update AI text content based on selections
function updateAITextContent() {
  const modelDropdown = document.getElementById('aiModelDropdown');
  const kit1Dropdown = document.getElementById('aiKit1Dropdown');
  const kit2Dropdown = document.getElementById('aiKit2Dropdown');
  const textContent = document.getElementById('aiTextContent');
  
  if (!textContent) return;
  
  let content = '';
  let hasSelection = false;
  
  // Check model selection
  if (modelDropdown && modelDropdown.value && modelDropdown.value !== 'select-model') {
    content += aiScreenData.models[modelDropdown.value] + '\n\n';
    hasSelection = true;
  }
  
  // Check kit 1 selection
  if (kit1Dropdown && kit1Dropdown.value && kit1Dropdown.value !== 'select-kit1') {
    content += aiScreenData.kit1[kit1Dropdown.value] + '\n\n';
    hasSelection = true;
  }
  
  // Check kit 2 selection
  if (kit2Dropdown && kit2Dropdown.value && kit2Dropdown.value !== 'select-kit2') {
    content += aiScreenData.kit2[kit2Dropdown.value] + '\n\n';
    hasSelection = true;
  }
  
  // Set content or default message
  if (hasSelection) {
    textContent.textContent = content.trim();
  } else {
    textContent.textContent = 'Welcome to AutomatAR AI Assistant! Select options from the cards on the right to learn more about our mechanical engineering kits and 3D models. Each selection will provide detailed information about the components, assembly instructions, and educational objectives.';
  }
  
  // Add smooth transition effect
  textContent.style.opacity = '0.7';
  setTimeout(() => {
    textContent.style.opacity = '1';
  }, 150);
}

// Handle help button clicks
function handleAIHelpClick(cardType) {
  let helpText = '';
  
  switch(cardType) {
    case 'model':
      helpText = 'Model Information: Select a 3D model to learn about its mechanical principles, components, and applications. Each model can be downloaded as an STL file for 3D printing and further study.';
      break;
    case 'kit1':
      helpText = 'Kit 1 Information: Choose from motion conversion kits (Cam-A, Cam-C, Crank) to explore how different mechanisms transform rotational motion into linear or intermittent motion patterns.';
      break;
    case 'kit2':
      helpText = 'Kit 2 Information: Select from gear system kits (Gear-A, Gear-B, Gear-C) to understand power transmission, torque multiplication, and directional changes in mechanical systems.';
      break;
  }
  
  // Show help in a temporary overlay
  showAIHelpOverlay(helpText);
}

// Show help overlay
function showAIHelpOverlay(text) {
  // Remove existing overlay if present
  const existingOverlay = document.querySelector('.ai-help-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create help overlay
  const overlay = document.createElement('div');
  overlay.className = 'ai-help-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(76, 175, 80, 0.95);
    color: white;
    padding: 2rem;
    border-radius: 16px;
    max-width: 400px;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    border: 2px solid #4CAF50;
    backdrop-filter: blur(10px);
    animation: aiHelpFadeIn 0.3s ease;
  `;
  
  overlay.innerHTML = `
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">${text}</p>
    <button onclick="this.parentElement.remove()" style="
      background: white;
      color: #4CAF50;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
      Got it!
    </button>
  `;
  
  // Add animation keyframes
  if (!document.querySelector('#aiHelpStyles')) {
    const style = document.createElement('style');
    style.id = 'aiHelpStyles';
    style.textContent = `
      @keyframes aiHelpFadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(overlay);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.style.animation = 'aiHelpFadeIn 0.3s ease reverse';
      setTimeout(() => overlay.remove(), 300);
    }
  }, 5000);
}

/********************************************
 * GLOBAL STATE & CONSTANTS
 ********************************************/
const PAGE_HOME = "HOME";
const PAGE_KIT_DETAIL = "KITDETAIL";
const PAGE_AR = "AR";
const PAGE_MANUALS = "MANUALS";
const PAGE_MODELS = "MODELS";
const PAGE_AI = "AI";

window.onload = function() {
  setupUI();
  showHomeScreen();  // Always start with home screen
  initScrollAnimations(); // Initialize scroll animations
  initVideoOptimization(); // Initialize video performance optimizations
};

/********************************************
 * SCREEN NAVIGATION FUNCTIONS
 ********************************************/

function showHomeScreen(){
  // Hide all screens first
  document.getElementById("mainHeader").style.display = "flex";
  document.getElementById("homeScreen").style.display = "block";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.remove("active");
  document.getElementById("aiScreen").classList.remove("active");
  
  // Reset AR overlay for next time
  document.getElementById("arInitialOverlay").classList.remove("hidden");
  
  // Force scroll to absolute top - multiple methods to ensure it works
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  window.scrollTo(0, 0);
  
  // Also reset homeScreen scroll position
  const homeScreen = document.getElementById("homeScreen");
  if (homeScreen) {
    homeScreen.scrollTop = 0;
  }
  
  // Reset assembly animation system
  if (assemblyElements && assemblyElements.length > 0) {
    assemblyElements.forEach(element => {
      element.isAssembled = false;
      element.lastRatio = 0;
      
      // Reset all elements to pre-assembly state
      element.kitText.classList.remove('assembled', 'disassembled');
      element.kitImage.classList.remove('assembled', 'disassembled');
      element.kitText.classList.add('pre-assembly');
      element.kitImage.classList.add('pre-assembly');
    });
  }
  
  currentAssembledSection = -1;
  
  // Use requestAnimationFrame to ensure DOM is updated before scrolling again
  requestAnimationFrame(() => {
    // Double-check scroll position after DOM updates
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
    
    // Re-initialize animations
    if (assemblyObserver) {
      assemblyObserver.disconnect();
    }
    initScrollAnimations();
    
    // Resume video playback for visible videos
    setTimeout(() => {
      resumeVisibleVideos();
    }, 200);
  });
}

function showKitDetailScreen(kitID){
  // Pause home screen videos
  pauseAllVideos();
  
  document.getElementById("mainHeader").style.display = "none";
  // Fill placeholders
  const kit = scenarios[kitID];
  document.getElementById("kitDetailTitle").textContent = kit ? kit.name : "Unknown Kit";
  document.getElementById("kitDetailDesc").textContent = kit ? kit.desc : "No description found.";

  // Update video source
  const video = document.getElementById("kitDetailVideo");
  const source = video.querySelector("source");
  source.src = `videos/kit${kitID+1}.mp4`;
  video.load(); // Reload the video with new source
  
  // Hide placeholder text when video is loaded
  video.addEventListener('loadeddata', function() {
    document.getElementById("kitDetailImg").style.display = "none";
  });

  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("kitDetailScreen").style.display = "block";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.remove("active");
  document.getElementById("aiScreen").classList.remove("active");
}

function showKitDetail(kitID) {
  showKitDetailScreen(kitID);
}

function showARScreen(){
  // Pause all videos to save resources
  pauseAllVideos();
  
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "block";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.remove("active");
  document.getElementById("aiScreen").classList.remove("active");
  
  // Show the initial overlay - don't start AR yet
  document.getElementById("arInitialOverlay").classList.remove("hidden");
}

function showManualsScreen(){
  pauseAllVideos();
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.add("active");
  document.getElementById("modelsScreen").classList.remove("active");
  document.getElementById("aiScreen").classList.remove("active");
}

function showModelsScreen(){
  pauseAllVideos();
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.add("active");
  document.getElementById("aiScreen").classList.remove("active");
}

function showAIScreen(){
  // Pause all videos to save resources
  pauseAllVideos();
  
  // Hide header and all other screens
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.remove("active");
  
  // Show AI screen
  document.getElementById("aiScreen").classList.add("active");
  
  // Update text content based on current selections
  updateAITextContent();
}

/********************************************
 * AR INITIALIZATION AND STARTUP
 ********************************************/

function startARExperience(){
  // Hide the initial overlay
  document.getElementById("arInitialOverlay").classList.add("hidden");
  
  // Now initialize AR with camera
  if(!video) {
    initAR();
  }
}

/********************************************
 * MANUAL AND MODEL MANAGEMENT
 ********************************************/

function openManual(manualNumber) {
  // Map manual numbers to kit names for title
  const kitNames = {
    '1': 'Cam-A Rotational Motion Manual',
    '2': 'Cam-C Intermittent Motion Manual', 
    '3': 'Crank Reciprocating Motion Manual',
    '4': 'Gear-A Bevel Gears Manual',
    '5': 'Gear-B Variable Speed Manual',
    '6': 'Gear-C Worm Gears Manual'
  };
  
  const pdfPath = `manuals/${manualNumber}.pdf`;
  const pdfFrame = document.getElementById('pdfFrame');
  const pdfFallback = document.getElementById('pdfFallback');
  const pdfDownloadLink = document.getElementById('pdfDownloadLink');
  const pdfViewerTitle = document.getElementById('pdfViewerTitle');
  const pdfViewerModal = document.getElementById('pdfViewerModal');
  
  // Set title
  pdfViewerTitle.textContent = kitNames[manualNumber] || 'Manual Viewer';
  
  // Try to load PDF in iframe
  pdfFrame.src = pdfPath;
  pdfDownloadLink.href = pdfPath;
  
  // Show modal
  pdfViewerModal.classList.add('active');
  
  // Handle iframe load error (fallback for browsers that don't support PDF embedding)
  pdfFrame.onload = function() {
    // Check if the iframe loaded successfully
    try {
      if (pdfFrame.contentDocument === null) {
        // PDF didn't load properly, show fallback
        pdfFrame.style.display = 'none';
        pdfFallback.style.display = 'flex';
      } else {
        pdfFrame.style.display = 'block';
        pdfFallback.style.display = 'none';
      }
    } catch (e) {
      // Cross-origin issue or PDF not supported
      pdfFrame.style.display = 'none';
      pdfFallback.style.display = 'flex';
    }
  };
  
  pdfFrame.onerror = function() {
    // PDF failed to load, show fallback
    pdfFrame.style.display = 'none';
    pdfFallback.style.display = 'flex';
  };
}

function closePdfViewer() {
  const pdfViewerModal = document.getElementById('pdfViewerModal');
  const pdfFrame = document.getElementById('pdfFrame');
  
  // Hide modal
  pdfViewerModal.classList.remove('active');
  
  // Clear iframe source to stop loading
  pdfFrame.src = '';
}

function downloadModel(modelNumber) {
  // Map model numbers to kit names for user feedback
  const kitNames = {
    '1': 'Cam-A 3D Model',
    '2': 'Cam-C 3D Model',
    '3': 'Crank 3D Model', 
    '4': 'Gear-A 3D Model',
    '5': 'Gear-B 3D Model',
    '6': 'Gear-C 3D Model',
    '7': 'Base Platform Model'
  };
  
  const modelPath = `kits-stl/${modelNumber}.stl`;
  const kitName = kitNames[modelNumber] || '3D Model';
  
  // Create a temporary link element for download
  const downloadLink = document.createElement('a');
  downloadLink.href = modelPath;
  downloadLink.download = `AutomatAR_${kitName.replace(/\s+/g, '_')}.stl`;
  
  // Check if file exists before attempting download
  fetch(modelPath, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // File exists, proceed with download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Show success message
        showDownloadNotification(`${kitName} downloaded successfully!`, 'success');
      } else {
        // File doesn't exist, show error
        showDownloadNotification(`${kitName} file not found. Please contact support.`, 'error');
      }
    })
    .catch(error => {
      // Network error or file not accessible
      console.warn('Download attempt failed:', error);
      showDownloadNotification(`Download failed. Please check your connection and try again.`, 'error');
    });
}

// Function to show download notifications
function showDownloadNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `download-notification ${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 600;
    max-width: 300px;
    word-wrap: break-word;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

/********************************************
 * UI SETUP AND EVENT HANDLERS
 ********************************************/

function setupUI(){
  // Home -> AR
  document.getElementById("openARBtn").onclick = function(){
    showARScreen();
  };
  
  // Manuals button
  document.getElementById("manualsBtn").onclick = function(){
    showManualsScreen();
  };
  
  // Models button
  document.getElementById("modelsBtn").onclick = function(){
    showModelsScreen();
  };
  
  // AI button
  document.getElementById("aiBtn").onclick = function(){
    showAIScreen();
  };
  
  // Kit detail -> Home
  document.getElementById("kitBackHomeBtn").onclick = function(){
    showHomeScreen();
  };
  
  // AR -> Home
  document.getElementById("backHomeBtn").onclick = function(){
    showHomeScreen();
  };
  
  // Manuals -> Home
  document.getElementById("closeManualsBtn").onclick = function(){
    showHomeScreen();
  };
  
  // Models -> Home
  document.getElementById("closeModelsBtn").onclick = function(){
    showHomeScreen();
  };
  
  // AI -> Home
  const closeAIBtn = document.getElementById("closeAIBtn");
  if (closeAIBtn) {
    closeAIBtn.onclick = function(){
      showHomeScreen();
    };
  }
  
  // PDF Viewer -> Close
  document.getElementById("closePdfViewer").onclick = function(){
    closePdfViewer();
  };
  
  // Debug overlay
  document.getElementById("debugSideBtn").onclick = toggleDebugOverlay;
  
  // AR instructions overlay handlers
  document.getElementById("arHelpBtn").onclick = toggleARInstructionsOverlay;
  document.getElementById("arInstructionsClose").onclick = toggleARInstructionsOverlay;
  
  // AR start button
  document.getElementById("arStartButton").onclick = function(){
    startARExperience();
  };
  
  // Close PDF viewer when clicking outside
  document.getElementById("pdfViewerModal").onclick = function(e) {
    if (e.target === this) {
      closePdfViewer();
    }
  };
  
  // Initialize AI screen functionality
  setTimeout(() => {
    initializeAIScreen();
  }, 100);
}

function toggleARInstructionsOverlay() {
  const overlay = document.getElementById("arInstructionsOverlay");
  overlay.classList.toggle("visible");
}

/********************************************
 * AR LOGIC
 ********************************************/
var video, canvas, context, imageData;
var renderer, scene, camera, backgroundScene, backgroundCamera, videoTexture;
var detector, posit;
var adaptiveFilter, multiScaleDetector, opticalFlowTracker;
var useAdaptiveFilter=false, useMultiScale=false, useOpticalFlow=false;
var modelSize=35.0;
var lastActiveIdentifierTag=null;
var scenarioConfidence = {
  // Existing kits (0–5)
  0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  // New scenario IDs (6–31):
  6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
  16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0,
  26: 0, 27: 0, 28: 0, 29: 0, 30: 0, 31: 0
};    
var SCENARIO_CONFIDENCE_THRESHOLD=3;
var stlLoader=null;
var stlCache={};
var lastFrameMarkers=[];

/* Updated scenario objects with your new DESCRIPTIONS */
var scenarios = [
  {
    name: "Cam-A",
    identifierTag: 0,
    desc: `Cam-A, illustrates how cams convert rotational motion into linear oscillatory motion. 
Cam: The cam is a rotating or sliding piece in a mechanical linkage that drives the follower. 
The cam's surface can be contoured (circular, elliptical, etc.) to create different motion 
in the follower as the cam rotates. The cam mechanism's ability to produce precise, complex 
motion from simple rotational input makes it invaluable in mechanical design. It's used in 
internal engines, filling/packing machines, and more.`,
    objects: [
      { tag: 6, stl: "sea_models/stringray.stl" }
    ]
  },
  {
    name: "Cam-C",
    identifierTag: 1,
    desc: `Cam-C illustrates how cams convert rotational motion to arranged, paused (intermittent) motion. 
It's a rotating drive wheel (driver) with a pin engaging slots in a driven wheel (Geneva wheel). 
This engagement causes precise timing & indexing. Between steps, the Geneva wheel remains locked 
in place. Widely used in clockwork, film projectors, assembly lines, etc., for controlled, 
intermittent motion from continuous input.`,
    objects: [
      { tag: 7, stl: "sea_models/jellyfish.stl" }
    ]
  },
  {
    name: "Crank",
    identifierTag: 2,
    desc: `Crank kit illustrates how a crank mechanism converts rotational motion into linear reciprocating motion. 
A rotating arm (the crank) pushes/pulls a connecting rod, creating back-and-forth movement. This 
simple but effective design ensures consistent rotation-to-reciprocation transfer. Used in engines, 
pumps, and presses, whenever converting rotary motion into linear is essential.`,
    objects: [
      { tag: 8, stl: "sea_models/dolphin.stl" }
    ]
  },
  {
    name: "Gear-A",
    identifierTag: 3,
    desc: `Gear-A demonstrates how bevel gears transfer rotational motion between perpendicular shafts, 
turning horizontal circular motion into vertical. Bevel gears have cone-shaped teeth meeting at 90°, 
redirecting motion while maintaining power transmission. Widely used in automobiles, drills, and 
other machinery needing efficient angled power transfer.`,
    objects: [
      { tag: 9, stl: "sea_models/octopus.stl" }
    ]
  },
  {
    name: "Gear-B",
    identifierTag: 4,
    desc: `Gear-B shows how gear alignment & shape affect torque/speed, even with a constant driver. This 
mechanism can cause continuous speed variation due to shifting alignment of the gears. The driver's 
turning changes load distribution, resulting in dynamic acceleration/deceleration. These "weird" 
gears are useful for specialized systems needing variable torque & non-uniform motion, e.g. 
adaptive transmissions.`,
    objects: [
      { tag: 10, stl: "sea_models/fishes.stl" }
    ]
  },
  {
    name: "Gear-C",
    identifierTag: 5,
    desc: `Gear-C is a worm gear system that converts rotational motion while significantly reducing speed & 
increasing torque. A screw-like worm drives a worm wheel, transferring motion at 90°. This design 
offers high torque output & a self-locking feature, so it can't be back-driven. Used in elevators, 
conveyors, tuning mechanisms—anywhere controlled motion & torque multiplication are vital.`,
    objects: [
      { tag: 11, stl: "sea_models/sea_turtle.stl" }
    ]
  }
  // Additional scenarios 6-31 can be added here if needed
];

function initAR(){
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  detector = new AR.Detector();
  posit = new POS.Posit(modelSize, canvas.width);

  adaptiveFilter = new AdaptiveThresholdFilter({ blockSize:21, C:5, useIntegralImage:true });
  multiScaleDetector = new MultiScaleDetector({ 
    detector: detector, 
    scales:[1.0,0.5,1.5], 
    confidenceThreshold:0.3 
  });
  opticalFlowTracker = new OpticalFlowTracker({
    winSize:15, maxError:10000, maxMotion:50, maxTrackedFrames:30
  });

  initCamera();
  initRenderer();
  stlLoader = new THREE.STLLoader();
  requestAnimationFrame(tick);
}

function initCamera(){
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    // Better camera constraints for mobile
    const isMobile = window.innerWidth <= 768;
    const constraints = {
      video: { 
        facingMode: "environment",
        width: isMobile ? { ideal: 640, max: 1280 } : { ideal: 1280 },
        height: isMobile ? { ideal: 480, max: 720 } : { ideal: 720 }
      }
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream){
      if("srcObject" in video){
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.play();
      
      // Ensure video dimensions are set correctly on mobile
      video.addEventListener('loadedmetadata', function() {
        console.log('Camera initialized:', video.videoWidth, 'x', video.videoHeight);
        
        // For mobile, update canvas size to match video
        if (window.IS_MOBILE_AR && video.videoWidth && video.videoHeight) {
          const videoAspect = video.videoWidth / video.videoHeight;
          canvas.width = Math.min(640, video.videoWidth);
          canvas.height = Math.round(canvas.width / videoAspect);
        }
      });
    })
    .catch(function(err){
      console.log("Camera error:", err);
      // Show user-friendly error message
      showARError("Camera access denied. Please enable camera permissions and refresh the page.");
    });
  } else {
    showARError("Camera not supported on this device.");
  }
}

// Add error display function
function showARError(message) {
  const arContainer = document.querySelector('.ar-container');
  if (arContainer) {
    arContainer.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: rgba(255, 140, 0, 0.9);
        color: white;
        text-align: center;
        padding: 2rem;
        border-radius: 12px;
        margin: 1rem;
      ">
        <h3 style="margin-bottom: 1rem;">Camera Error</h3>
        <p style="margin-bottom: 2rem;">${message}</p>
        <button onclick="showHomeScreen()" style="
          background: white;
          color: #FF8C00;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">Return to Home</button>
      </div>
    `;
  }
}

// Updated initRenderer function with better mobile support
function initRenderer(){
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Better mobile detection and sizing
  const isMobile = viewportWidth <= 768;
  const isVerySmall = viewportWidth <= 480;
  
  let renderWidth, renderHeight;
  
  if (isMobile) {
    // On mobile, use more of the available space
    if (isVerySmall) {
      // Very small screens - use almost full viewport
      renderWidth = Math.min(viewportWidth, viewportWidth * 0.95);
      renderHeight = Math.min(viewportHeight * 0.75, renderWidth * (4/3)); // 4:3 ratio for small screens
    } else {
      // Regular mobile - use more flexible ratio
      renderWidth = viewportWidth * 0.9;
      renderHeight = Math.min(viewportHeight * 0.7, renderWidth * (3/2)); // 3:2 ratio
    }
  } else {
    // Desktop - use 16:9 as before
    const targetAspect = 16 / 9;
    const viewportAspect = viewportWidth / viewportHeight;
    
    if (viewportAspect > targetAspect) {
      renderHeight = viewportHeight * 0.85; // Leave some space for UI
      renderWidth = Math.round(renderHeight * targetAspect);
    } else {
      renderWidth = viewportWidth * 0.85;
      renderHeight = Math.round(renderWidth / targetAspect);
    }
  }
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(renderWidth, renderHeight);
  
  const threeContainer = document.getElementById("threeContainer");
  threeContainer.appendChild(renderer.domElement);
  
  // Update container styling for mobile
  if (isMobile) {
    threeContainer.style.position = 'absolute';
    threeContainer.style.top = '50%';
    threeContainer.style.left = '50%';
    threeContainer.style.transform = 'translate(-50%, -50%)';
    threeContainer.style.width = renderWidth + 'px';
    threeContainer.style.height = renderHeight + 'px';
    threeContainer.style.maxWidth = '100vw';
    threeContainer.style.maxHeight = '80vh'; // Leave space for sidebar
  } else {
    // Desktop positioning
    threeContainer.style.position = 'absolute';
    threeContainer.style.top = '0';
    threeContainer.style.left = '50%';
    threeContainer.style.transform = 'translateX(-50%)';
    threeContainer.style.width = 'auto';
    threeContainer.style.height = '100%';
  }
  
  videoTexture = new THREE.Texture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  
  backgroundScene = new THREE.Scene();
  backgroundCamera = new THREE.Camera();
  
  // Adjust plane geometry based on aspect ratio
  const aspectRatio = renderWidth / renderHeight;
  const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(aspectRatio * 1.2, 1.2), // Dynamic sizing
      new THREE.MeshBasicMaterial({ map: videoTexture, depthTest: false, depthWrite: false })
  );
  plane.material.side = THREE.DoubleSide;
  plane.position.z = -1;
  backgroundScene.add(backgroundCamera);
  backgroundScene.add(plane);
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
      isMobile ? 50 : 40, // Wider FOV on mobile for better visibility
      renderWidth / renderHeight,
      1,
      1000
  );
  scene.add(camera);
  
  const ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);
  
  // Store dimensions for CV processing
  window.CV_RENDER_WIDTH = renderWidth;
  window.CV_RENDER_HEIGHT = renderHeight;
  window.IS_MOBILE_AR = isMobile;
}

// Resize handler to maintain proper aspect ratio
function handleResize() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth <= 768;
  const isVerySmall = viewportWidth <= 480;
  
  let renderWidth, renderHeight;
  
  if (isMobile) {
    if (isVerySmall) {
      renderWidth = Math.min(viewportWidth, viewportWidth * 0.95);
      renderHeight = Math.min(viewportHeight * 0.75, renderWidth * (4/3));
    } else {
      renderWidth = viewportWidth * 0.9;
      renderHeight = Math.min(viewportHeight * 0.7, renderWidth * (3/2));
    }
    
    // Update container positioning for mobile
    const threeContainer = document.getElementById("threeContainer");
    threeContainer.style.position = 'absolute';
    threeContainer.style.top = '50%';
    threeContainer.style.left = '50%';
    threeContainer.style.transform = 'translate(-50%, -50%)';
    threeContainer.style.width = renderWidth + 'px';
    threeContainer.style.height = renderHeight + 'px';
    threeContainer.style.maxWidth = '100vw';
    threeContainer.style.maxHeight = '80vh';
  } else {
    // Desktop sizing
    const targetAspect = 16 / 9;
    const viewportAspect = viewportWidth / viewportHeight;
    
    if (viewportAspect > targetAspect) {
      renderHeight = viewportHeight * 0.85;
      renderWidth = Math.round(renderHeight * targetAspect);
    } else {
      renderWidth = viewportWidth * 0.85;
      renderHeight = Math.round(renderWidth / targetAspect);
    }
    
    // Desktop positioning
    const threeContainer = document.getElementById("threeContainer");
    threeContainer.style.position = 'absolute';
    threeContainer.style.top = '0';
    threeContainer.style.left = '50%';
    threeContainer.style.transform = 'translateX(-50%)';
    threeContainer.style.width = 'auto';
    threeContainer.style.height = '100%';
  }
  
  if (renderer) {
    renderer.setSize(renderWidth, renderHeight);
    camera.aspect = renderWidth / renderHeight;
    camera.updateProjectionMatrix();
  }
  
  window.CV_RENDER_WIDTH = renderWidth;
  window.CV_RENDER_HEIGHT = renderHeight;
  window.IS_MOBILE_AR = isMobile;
}

window.addEventListener('resize', handleResize);

function tick(){
  requestAnimationFrame(tick);
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    try{
      context.drawImage(video,0,0,canvas.width,canvas.height);
      imageData = context.getImageData(0,0,canvas.width,canvas.height);
    } catch(e){ return; }

    if(videoTexture) videoTexture.needsUpdate = true;

    let markers = detector.detect(imageData);
    markers = processFilters(markers);

    updateScene(markers);

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);

    lastFrameMarkers = markers.slice();

    let overlay = document.getElementById("debugOverlay");
    if(overlay.classList.contains("visible")){
      drawDebugCanvas();
    }
  }
}

function processFilters(markers){
  let finalMarkers = markers.slice();
  if(useAdaptiveFilter){
    try {
      const processed = adaptiveFilter.process(imageData);
      const atf = detector.detect(processed);
      atf.forEach(m => {
        if(!markerExists(finalMarkers,m)) finalMarkers.push(m);
      });
    } catch(e){}
  }
  if(useMultiScale){
    try {
      const ms = multiScaleDetector.detect(imageData);
      ms.forEach(m => {
        if(!markerExists(finalMarkers,m)) finalMarkers.push(m);
      });
    } catch(e){}
  }
  if(useOpticalFlow){
    try {
      const ofm = opticalFlowTracker.track(imageData, finalMarkers);
      if(ofm && ofm.length>0) finalMarkers = ofm;
    } catch(e){}
  }
  return finalMarkers;
}

function markerExists(list, marker){
  return list.some(m => (m.id===marker.id && areMarkersClose(m,marker)));
}

function areMarkersClose(m1,m2){
  let c1={x:0,y:0}, c2={x:0,y:0};
  for(let i=0; i<4; i++){
    c1.x += m1.corners[i].x; c1.y += m1.corners[i].y;
    c2.x += m2.corners[i].x; c2.y += m2.corners[i].y;
  }
  c1.x/=4; c1.y/=4; c2.x/=4; c2.y/=4;
  let dx=c1.x-c2.x, dy=c1.y-c2.y;
  return (Math.sqrt(dx*dx+dy*dy)<20);
}

function updateScene(markers){
  while(scene.children.length>3){
    scene.remove(scene.children[3]);
  }
  const markerMap = {};
  markers.forEach(m => { markerMap[m.id] = m; });

  let visibleScenarioIDs = [];
  scenarios.forEach(s => {
    if(markerMap[s.identifierTag]) visibleScenarioIDs.push(s.identifierTag);
  });

  for(let sid in scenarioConfidence){
    if(visibleScenarioIDs.includes(parseInt(sid))) scenarioConfidence[sid]++;
    else scenarioConfidence[sid]=0;
  }

  let bestScenarioID=null, bestConfidence=0;
  for(let sid in scenarioConfidence){
    let val=scenarioConfidence[sid];
    if(val>=SCENARIO_CONFIDENCE_THRESHOLD && val>bestConfidence){
      bestConfidence=val; 
      bestScenarioID=parseInt(sid);
    }
  }
  if(bestScenarioID!==null){
    lastActiveIdentifierTag=bestScenarioID;
  }

  let activeScenario=null;
  if(lastActiveIdentifierTag!==null){
    activeScenario=scenarios.find(s=>s.identifierTag===lastActiveIdentifierTag);
  }

  // auto filter switching
  if(lastActiveIdentifierTag!==null){
    if(lastActiveIdentifierTag===0||lastActiveIdentifierTag===2){
      useAdaptiveFilter=true; useMultiScale=true; useOpticalFlow=true;
    } else if([1,3,4,5].includes(lastActiveIdentifierTag)){
      useAdaptiveFilter=true; useMultiScale=true; useOpticalFlow=false;
    }
  }

  if(activeScenario){
    activeScenario.objects.forEach(obj=>{
      if(markerMap[obj.tag]){
        placeObject(markerMap[obj.tag], obj.stl);
      }
    });
  }

  // Update side panel
  const kitNameEl = document.getElementById("arKitName");
  const kitDescEl = document.getElementById("arKitDesc");
  if(activeScenario && visibleScenarioIDs.includes(activeScenario.identifierTag)){
    kitNameEl.textContent = activeScenario.name;
    kitDescEl.textContent = activeScenario.desc;
  } else {
    kitNameEl.textContent = "No kits detected";
    kitDescEl.textContent = "Point your camera at a marker to see kit information";
  }
}

function placeObject(marker, stlRelativePath){
  let stlFullPath = "models/"+stlRelativePath;
  let corners=[];
  for(let i=0;i<marker.corners.length;i++){
    corners.push({
      x: marker.corners[i].x-(canvas.width/2),
      y: (canvas.height/2)-marker.corners[i].y
    });
  }
  let pose=posit.pose(corners);

  loadStl(stlFullPath,function(geometry){
    geometry.computeBoundingBox();
    let min=geometry.boundingBox.min, max=geometry.boundingBox.max;
    let center=new THREE.Vector3().addVectors(min,max).multiplyScalar(0.5);
    let offset=center.clone().multiplyScalar(-1);

    if(geometry.isBufferGeometry){
      geometry.translate(offset.x,offset.y,offset.z);
    } else {
      let mat=new THREE.Matrix4().makeTranslation(offset.x,offset.y,offset.z);
      geometry.applyMatrix(mat);
    }

    let material=new THREE.MeshPhongMaterial({color:0xD4A574});
    let mesh=new THREE.Mesh(geometry,material);

    let scaleFactor=0.05*modelSize*0.02;
    mesh.scale.set(scaleFactor,scaleFactor,scaleFactor);

    let r=pose.bestRotation;
    mesh.rotation.x=-Math.asin(-r[1][2]);
    mesh.rotation.y=-Math.atan2(r[0][2],r[2][2]);
    mesh.rotation.z=Math.atan2(r[1][0],r[1][1]);

    mesh.position.x=pose.bestTranslation[0];
    mesh.position.y=pose.bestTranslation[1];
    mesh.position.z=-pose.bestTranslation[2];

    scene.add(mesh);
  });
}

function loadStl(path,cb){
  if(stlCache[path]){
    cb(stlCache[path]);
    return;
  }
  stlLoader.load(path,function(geom){
    stlCache[path]=geom;cb(geom);
  });
}

/* DEBUG Overlay */
function toggleDebugOverlay(){
  let overlay=document.getElementById("debugOverlay");
  overlay.classList.toggle("visible");
  if(overlay.classList.contains("visible")){
    canvas.style.display="block";
  } else {
    canvas.style.display="none";
  }
}

function drawDebugCanvas(){
  let dbgCanvas=document.getElementById("debugCanvas");
  let dbgCtx=dbgCanvas.getContext("2d");
  dbgCtx.clearRect(0,0,dbgCanvas.width,dbgCanvas.height);
  dbgCtx.drawImage(canvas,0,0);

  dbgCtx.strokeStyle="lime";
  dbgCtx.lineWidth=2;
  lastFrameMarkers.forEach(m=>{
    let c=m.corners;
    dbgCtx.beginPath();
    dbgCtx.moveTo(c[0].x,c[0].y);
    dbgCtx.lineTo(c[1].x,c[1].y);
    dbgCtx.lineTo(c[2].x,c[2].y);
    dbgCtx.lineTo(c[3].x,c[3].y);
    dbgCtx.closePath();
    dbgCtx.stroke();
  });

  let txt=(lastFrameMarkers.length===0)?"No markers detected.\n":"";
  lastFrameMarkers.forEach(m=>{
    txt+="Marker ID "+m.id+"\n";
  });
  document.getElementById("markerInfo").textContent=txt;
}

/********************************************
 * GLOBAL FUNCTION EXPORTS
 ********************************************/

// Make functions globally available
window.showHomeScreen = showHomeScreen;
window.showKitDetail = showKitDetail;
window.showARScreen = showARScreen;
window.showManualsScreen = showManualsScreen;
window.showModelsScreen = showModelsScreen;
window.showAIScreen = showAIScreen;
window.handleAIHelpClick = handleAIHelpClick;
window.openManual = openManual;
window.downloadModel = downloadModel;
window.startARExperience = startARExperience;
window.toggleDebugOverlay = toggleDebugOverlay;


/**
 * Ice Blue AI Interface JavaScript
 * Handles dropdown functionality for game card interface
 */

// Global variables for AI interface
let iceDropdownStates = {
  aiModelDropdown: null,
  aiKit1Dropdown: null, 
  aiKit2Dropdown: null
};

/**
 * Initialize AI Interface when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeIceBlueDropdowns();
});

/**
 * Initialize the ice blue dropdown functionality
 */
function initializeIceBlueDropdowns() {
  const dropdownTriggers = document.querySelectorAll('.ai-dropdown-trigger-ice');
  
  if (dropdownTriggers.length === 0) {
    // If dropdowns aren't loaded yet, try again after a delay
    setTimeout(initializeIceBlueDropdowns, 100);
    return;
  }
  
  dropdownTriggers.forEach(trigger => {
    const dropdownId = trigger.getAttribute('data-dropdown');
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;
    
    const options = dropdown.querySelectorAll('.dropdown-option-ice');
    
    // Toggle dropdown on trigger click
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Close other dropdowns first
      closeAllIceDropdowns();
      
      // Toggle current dropdown
      const isOpen = dropdown.classList.contains('open');
      if (!isOpen) {
        openIceDropdown(dropdown, trigger);
      }
    });
    
    // Handle option selection
    options.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const value = this.getAttribute('data-value');
        const text = this.textContent;
        
        // Update trigger text and state
        updateIceDropdownSelection(trigger, dropdown, value, text, this);
        
        // Close dropdown
        closeIceDropdown(dropdown, trigger);
        
        // Store the selection and trigger content update
        storeIceAISelection(dropdownId, value);
        updateAITextContent();
        
        // Visual feedback
        addIceCardFeedback(trigger);
      });
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.ai-dropdown-container-ice')) {
      closeAllIceDropdowns();
    }
  });
  
  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllIceDropdowns();
    }
  });
}

/**
 * Open specific dropdown
 */
function openIceDropdown(dropdown, trigger) {
  dropdown.classList.add('open');
  trigger.classList.add('active');
  
  // Ensure dropdown is positioned correctly for downward opening
  positionIceDropdown(dropdown);
}

/**
 * Close specific dropdown
 */
function closeIceDropdown(dropdown, trigger) {
  dropdown.classList.remove('open');
  trigger.classList.remove('active');
}

/**
 * Close all open dropdowns
 */
function closeAllIceDropdowns() {
  const dropdowns = document.querySelectorAll('.ai-dropdown-menu-ice');
  const triggers = document.querySelectorAll('.ai-dropdown-trigger-ice');
  
  dropdowns.forEach(dropdown => {
    dropdown.classList.remove('open');
  });
  
  triggers.forEach(trigger => {
    trigger.classList.remove('active');
  });
}

/**
 * Update dropdown selection state
 */
function updateIceDropdownSelection(trigger, dropdown, value, text, selectedOption) {
  // Update trigger text
  const dropdownText = trigger.querySelector('.dropdown-text-ice');
  if (dropdownText) {
    dropdownText.textContent = text;
  }
  
  // Update selected state for options
  const options = dropdown.querySelectorAll('.dropdown-option-ice');
  options.forEach(opt => opt.classList.remove('selected'));
  selectedOption.classList.add('selected');
  
  // Store selection in dropdown state
  const dropdownId = trigger.getAttribute('data-dropdown');
  iceDropdownStates[dropdownId] = {
    value: value,
    text: text
  };
}

/**
 * Position dropdown for downward opening
 */
function positionIceDropdown(dropdown) {
  const rect = dropdown.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const container = dropdown.closest('.ai-game-card');
  
  if (!container) return;
  
  // Check if dropdown would go off-screen bottom
  if (rect.bottom > viewportHeight - 20) {
    // If dropdown goes below viewport, position it above the trigger
    dropdown.style.top = 'auto';
    dropdown.style.bottom = '100%';
    dropdown.style.marginTop = '0';
    dropdown.style.marginBottom = '4px';
  } else {
    // Keep default downward positioning
    dropdown.style.top = '100%';
    dropdown.style.bottom = 'auto';
    dropdown.style.marginTop = '4px';
    dropdown.style.marginBottom = '0';
  }
}

/**
 * Store AI selection for integration with existing system
 */
function storeIceAISelection(dropdownId, value) {
  // Create or update hidden select elements for compatibility
  const hiddenSelectId = dropdownId.replace('Dropdown', '') + 'Hidden';
  let hiddenSelect = document.getElementById(hiddenSelectId);
  
  if (!hiddenSelect) {
    hiddenSelect = document.createElement('select');
    hiddenSelect.id = hiddenSelectId;
    hiddenSelect.style.display = 'none';
    document.body.appendChild(hiddenSelect);
  }
  
  hiddenSelect.value = value;
  
  // Create option if it doesn't exist
  if (!hiddenSelect.querySelector(`option[value="${value}"]`)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    hiddenSelect.appendChild(option);
  }
}

/**
 * Visual feedback for card selection
 */
function addIceCardFeedback(trigger) {
  const card = trigger.closest('.ai-game-card');
  if (!card) return;
  
  // Ice glow effect
  const originalBoxShadow = card.style.boxShadow;
  card.style.boxShadow = `
    0 16px 50px rgba(0, 188, 212, 0.4),
    0 8px 24px rgba(3, 169, 244, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.6)
  `;
  card.style.transform = 'translateY(-2px)';
  card.style.transition = 'all 0.3s ease';
  
  // Reset after animation
  setTimeout(() => {
    card.style.boxShadow = originalBoxShadow;
    card.style.transform = '';
    card.style.transition = '';
  }, 500);
}

/**
 * Enhanced AI text content update function
 */
function updateAITextContent() {
  const textContent = document.getElementById('aiTextContent');
  if (!textContent) return;
  
  let content = '';
  let hasSelection = false;
  
  // Check for hidden selections
  const modelSelect = document.getElementById('aiModelHidden');
  const kit1Select = document.getElementById('aiKit1Hidden');
  const kit2Select = document.getElementById('aiKit2Hidden');
  
  // Use existing aiScreenData if available, otherwise use fallback
  const dataSource = typeof aiScreenData !== 'undefined' ? aiScreenData : getIceFallbackData();
  
  // Check model selection
  if (modelSelect && modelSelect.value && modelSelect.value !== 'select-model') {
    const modelInfo = dataSource.models[modelSelect.value];
    if (modelInfo) {
      content += '🎯 3D MODEL SELECTED:\n' + modelInfo + '\n\n';
      hasSelection = true;
    }
  }
  
  // Check kit 1 selection  
  if (kit1Select && kit1Select.value && kit1Select.value !== 'select-kit1') {
    const kit1Info = dataSource.kit1[kit1Select.value];
    if (kit1Info) {
      content += '⚙️ MOTION KIT SELECTED:\n' + kit1Info + '\n\n';
      hasSelection = true;
    }
  }
  
  // Check kit 2 selection
  if (kit2Select && kit2Select.value && kit2Select.value !== 'select-kit2') {
    const kit2Info = dataSource.kit2[kit2Select.value];
    if (kit2Info) {
      content += '🔧 GEAR KIT SELECTED:\n' + kit2Info + '\n\n';
      hasSelection = true;
    }
  }
  
  // Set content or default message
  if (hasSelection) {
    textContent.textContent = content.trim();
  } else {
    textContent.textContent = 'Welcome to AutomatAR AI Assistant! Select options from the ice blue game cards to learn more about our mechanical engineering kits and 3D models.\n\nEach selection will provide detailed information about the components, assembly instructions, and educational objectives.\n\nClick on any dropdown to begin exploring our mechanical engineering resources.';
  }
  
  // Smooth transition effect
  textContent.style.opacity = '0.7';
  setTimeout(() => {
    textContent.style.opacity = '1';
  }, 150);
}

/**
 * Fallback data if aiScreenData is not available
 */
function getIceFallbackData() {
  return {
    models: {
      'cam-a-model': 'Cam-A 3D Model: High-resolution STL model of the cam mechanism. This model demonstrates how cams convert rotational motion into linear oscillatory motion using contoured surfaces. The cam\'s rotating surface drives the follower in precise, complex patterns. Perfect for 3D printing and CAD analysis.',
      'cam-c-model': 'Cam-C 3D Model: Geneva wheel mechanism model showcasing intermittent motion principles. Features both the drive wheel with pin and the indexed Geneva wheel with slots. This model illustrates how continuous rotation creates precise, timed intermittent motion.',
      'crank-model': 'Crank 3D Model: Complete crank mechanism with connecting rod and slider components. Demonstrates the conversion of rotational motion into linear reciprocating motion through the crank-slider mechanism used in engines and pumps.',
      'gear-a-model': 'Gear-A 3D Model: Precision bevel gear set demonstrating 90-degree power transmission. Features cone-shaped teeth that meet at right angles, showing how rotational motion can be redirected while maintaining efficient power transfer.',
      'gear-b-model': 'Gear-B 3D Model: Variable speed gear system showcasing dynamic torque distribution. This model demonstrates how gear alignment and shape can create non-uniform motion and variable speed output from constant input.',
      'gear-c-model': 'Gear-C 3D Model: Worm gear assembly featuring self-locking mechanism and high torque multiplication. Shows the screw-like worm driving the worm wheel at 90 degrees with significant speed reduction and torque increase.'
    },
    kit1: {
      'cam-a-kit': 'Cam-A Kit: Learn rotational motion conversion through hands-on assembly. This kit includes all components needed to build a functional cam mechanism: the cam disc, follower, base plate, and mounting hardware. Students can observe how different cam profiles create various motion patterns.',
      'cam-c-kit': 'Cam-C Kit: Explore intermittent motion with the Geneva wheel mechanism. Kit contains the drive wheel with pin, Geneva wheel with precision-cut slots, timing guides, and assembly base. Perfect for understanding how continuous input creates stepped, controlled output motion.',
      'crank-kit': 'Crank Kit: Master reciprocating motion mechanics. Includes crank arm, connecting rod, slider mechanism, guide rails, and mounting base. Students can experiment with different crank lengths and observe how this affects stroke length and force characteristics.'
    },
    kit2: {
      'gear-a-kit': 'Gear-A Kit: Understand perpendicular power transmission with bevel gears. Contains matched pair of bevel gears, right-angle mounting frame, input and output shafts, and bearings. Demonstrates efficient 90-degree power redirection used in automotive differentials.',
      'gear-b-kit': 'Gear-B Kit: Explore variable speed transmission systems. Features specially designed gear sets with non-circular profiles, adjustable mounting system, and measurement tools. Shows how gear geometry affects speed variation and torque characteristics.',
      'gear-c-kit': 'Gear-C Kit: Experience worm gear systems and their unique properties. Includes precision worm screw, worm wheel, self-locking demonstration setup, and torque measurement tools. Perfect for understanding high reduction ratios and irreversible motion transmission.'
    }
  };
}

/**
 * Reset all dropdowns to initial state
 */
function resetIceDropdowns() {
  const triggers = document.querySelectorAll('.ai-dropdown-trigger-ice');
  
  triggers.forEach(trigger => {
    const dropdownText = trigger.querySelector('.dropdown-text-ice');
    const dropdownId = trigger.getAttribute('data-dropdown');
    
    // Reset trigger text to default
    if (dropdownText) {
      if (dropdownId === 'aiModelDropdown') {
        dropdownText.textContent = 'Select Model';
      } else if (dropdownId === 'aiKit1Dropdown') {
        dropdownText.textContent = 'Select Motion';
      } else if (dropdownId === 'aiKit2Dropdown') {
        dropdownText.textContent = 'Select Gear';
      }
    }
    
    // Reset dropdown state
    iceDropdownStates[dropdownId] = null;
  });
  
  // Clear all selected options
  const options = document.querySelectorAll('.dropdown-option-ice');
  options.forEach(option => option.classList.remove('selected'));
  
  // Remove hidden selects
  const hiddenSelects = document.querySelectorAll('[id$="Hidden"]');
  hiddenSelects.forEach(select => {
    if (select.parentNode) {
      select.parentNode.removeChild(select);
    }
  });
  
  // Update text content
  updateAITextContent();
}

/**
 * Get current AI selections
 */
function getIceAISelections() {
  return {
    model: iceDropdownStates.aiModelDropdown,
    kit1: iceDropdownStates.aiKit1Dropdown,
    kit2: iceDropdownStates.aiKit2Dropdown
  };
}

/**
 * Handle window resize to ensure single view
 */
function handleIceResize() {
  // Ensure dropdowns are positioned correctly after resize
  const openDropdowns = document.querySelectorAll('.ai-dropdown-menu-ice.open');
  openDropdowns.forEach(dropdown => {
    positionIceDropdown(dropdown);
  });
}

// Add resize listener
window.addEventListener('resize', handleIceResize);

// Export functions for global access
if (typeof window !== 'undefined') {
  window.initializeIceBlueDropdowns = initializeIceBlueDropdowns;
  window.resetIceDropdowns = resetIceDropdowns;
  window.getIceAISelections = getIceAISelections;
  window.updateAITextContent = updateAITextContent;
}

/**
 * AI Kit Image Display Enhancement
 * Handles dynamic image display when kits or models are selected from dropdowns
 * 
 * Kit Image Mapping:
 * kit1.png = Cam-A (Rotational to linear oscillatory motion)
 * kit2.png = Cam-C (Intermittent motion - Geneva wheel mechanism)
 * kit3.png = Crank (Reciprocating motion systems)
 * kit4.png = Gear-A (Bevel gears - 90° power transmission)
 * kit5.png = Gear-B (Variable speed gear systems)
 * kit6.png = Gear-C (Worm gear systems with self-locking)
 * 
 * Model Image Mapping:
 * string-ray.png = String Ray 3D Model
 * fish.png = Fish 3D Model
 * dolphin.png = Dolphin 3D Model
 * jellyfish.png = Jellyfish 3D Model
 * octopus.png = Octopus 3D Model
 * sea-turtle.png = Sea Turtle 3D Model
 */

// Kit image mapping based on the provided order
const kitImageMapping = {
  // Kit models (kit1.png to kit6.png)
  'cam-a-model': 'kit1.png',    // Cam-A: Rotational to linear oscillatory motion
  'cam-c-model': 'kit2.png',    // Cam-C: Intermittent motion (Geneva wheel mechanism)
  'crank-model': 'kit3.png',    // Crank: Reciprocating motion systems
  'gear-a-model': 'kit4.png',   // Gear-A: Bevel gears (90° power transmission)
  'gear-b-model': 'kit5.png',   // Gear-B: Variable speed gear systems
  'gear-c-model': 'kit6.png',   // Gear-C: Worm gear systems with self-locking
  
  // Sea creature 3D models
  'string-ray-model': 'string-ray.png',
  'fish-model': 'fish.png',
  'dolphin-model': 'dolphin.png',
  'jellyfish-model': 'jellyfish.png',
  'octopus-model': 'octopus.png',
  'sea-turtle-model': 'sea-turtle.png'
};

// Global state for tracking image display
let imageDisplayStates = {
  aiModelDropdown: { hasImage: false, currentImage: null },
  aiKit1Dropdown: { hasImage: false, currentImage: null },
  aiKit2Dropdown: { hasImage: false, currentImage: null }
};

/**
 * Initialize the AI image display system
 */
function initializeAIImageDisplay() {
  console.log('Initializing AI Image Display System...');
  
  // Set up dropdown event listeners with image handling
  setupImageDropdownListeners();
  
  // Initialize all images to placeholder state
  resetAllKitImages();
  
  console.log('AI Image Display System initialized successfully');
}

/**
 * Set up dropdown event listeners with image display functionality
 */
function setupImageDropdownListeners() {
  const dropdownTriggers = document.querySelectorAll('.ai-dropdown-trigger-ice');
  
  if (dropdownTriggers.length === 0) {
    console.warn('No dropdown triggers found. Retrying in 100ms...');
    setTimeout(setupImageDropdownListeners, 100);
    return;
  }
  
  dropdownTriggers.forEach(trigger => {
    const dropdownId = trigger.getAttribute('data-dropdown');
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) {
      console.warn(`Dropdown not found: ${dropdownId}`);
      return;
    }
    
    const options = dropdown.querySelectorAll('.dropdown-option-ice');
    
    // Toggle dropdown on trigger click
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Close other dropdowns first
      closeAllDropdowns();
      
      // Toggle current dropdown
      const isOpen = dropdown.classList.contains('open');
      if (!isOpen) {
        openDropdown(dropdown, trigger);
      }
    });
    
    // Handle option selection with image update
    options.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const value = this.getAttribute('data-value');
        const text = this.textContent;
        const kitImage = this.getAttribute('data-kit-image');
        
        // Update trigger text and state
        updateDropdownSelection(trigger, dropdown, value, text, this);
        
        // Handle image display
        updateKitImage(dropdownId, value, kitImage);
        
        // Close dropdown
        closeDropdown(dropdown, trigger);
        
        // Update AI text content (if function exists)
        if (typeof updateAITextContent === 'function') {
          updateAITextContent();
        }
        
        // Visual feedback
        addCardFeedback(trigger);
      });
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.ai-dropdown-container-ice')) {
      closeAllDropdowns();
    }
  });
  
  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

/**
 * Update dropdown selection state
 */
function updateDropdownSelection(trigger, dropdown, value, text, selectedOption) {
  // Update trigger text
  const dropdownText = trigger.querySelector('.dropdown-text-ice');
  if (dropdownText) {
    dropdownText.textContent = text;
  }
  
  // Update selected state for options
  const options = dropdown.querySelectorAll('.dropdown-option-ice');
  options.forEach(opt => opt.classList.remove('selected'));
  selectedOption.classList.add('selected');
  
  // Store selection state (if global state exists)
  if (typeof iceDropdownStates !== 'undefined') {
    const dropdownId = trigger.getAttribute('data-dropdown');
    iceDropdownStates[dropdownId] = {
      value: value,
      text: text
    };
  }
}

/**
 * Update kit image based on selection
 * @param {string} dropdownId - The dropdown identifier
 * @param {string} value - The selected value
 * @param {string} imageFile - The image filename from data attribute
 */
function updateKitImage(dropdownId, value, imageFile) {
  let imageId, placeholderId;
  
  // Determine which image containers to update
  switch(dropdownId) {
    case 'aiModelDropdown':
      imageId = 'modelImage';
      placeholderId = 'modelImagePlaceholder';
      break;
    case 'aiKit1Dropdown':
      imageId = 'kit1Image';
      placeholderId = 'kit1ImagePlaceholder';
      break;
    case 'aiKit2Dropdown':
      imageId = 'kit2Image';
      placeholderId = 'kit2ImagePlaceholder';
      break;
    default:
      console.warn(`Unknown dropdown ID: ${dropdownId}`);
      return;
  }
  
  const imageElement = document.getElementById(imageId);
  const placeholderElement = document.getElementById(placeholderId);
  
  if (!imageElement || !placeholderElement) {
    console.error(`Image elements not found for ${dropdownId}`);
    return;
  }
  
  // Get image filename from data attribute or mapping
  let imageSrc = imageFile || kitImageMapping[value];
  
  if (imageSrc) {
    showKitImage(imageElement, placeholderElement, imageSrc, dropdownId);
  } else {
    console.warn(`No image found for value: ${value}`);
    hideImage(imageElement, placeholderElement, dropdownId);
  }
}

/**
 * Show kit image with animation
 * @param {Element} imageElement - The image element
 * @param {Element} placeholderElement - The placeholder element
 * @param {string} imageSrc - The image source filename
 * @param {string} dropdownId - The dropdown identifier
 */
function showKitImage(imageElement, placeholderElement, imageSrc, dropdownId) {
  const container = imageElement.closest('.ai-card-image-container');
  const currentState = imageDisplayStates[dropdownId];
  
  // Check if we're switching from one image to another
  const isImageSwitch = currentState.hasImage && imageElement.style.display === 'block';
  
  if (isImageSwitch) {
    // First hide the current image, then show the new one
    hideCurrentImageThenShow(imageElement, placeholderElement, imageSrc, dropdownId, container);
  } else {
    // No current image, show new image directly
    showNewImage(imageElement, placeholderElement, imageSrc, dropdownId, container);
  }
}

/**
 * Hide current image then show new image
 * @param {Element} imageElement - The image element
 * @param {Element} placeholderElement - The placeholder element
 * @param {string} imageSrc - The image source filename
 * @param {string} dropdownId - The dropdown identifier
 * @param {Element} container - The image container element
 */
function hideCurrentImageThenShow(imageElement, placeholderElement, imageSrc, dropdownId, container) {
  // Add hide animation to current image
  imageElement.classList.add('hide-current');
  imageElement.classList.remove('visible');
  
  // After hide animation completes, show new image
  setTimeout(() => {
    // Clear current image
    imageElement.classList.remove('hide-current');
    imageElement.style.display = 'none';
    imageElement.src = '';
    
    // Show new image
    showNewImage(imageElement, placeholderElement, imageSrc, dropdownId, container);
  }, 300); // Match the hide animation duration
}

/**
 * Show new image with reveal animation
 * @param {Element} imageElement - The image element
 * @param {Element} placeholderElement - The placeholder element
 * @param {string} imageSrc - The image source filename
 * @param {string} dropdownId - The dropdown identifier
 * @param {Element} container - The image container element
 */
function showNewImage(imageElement, placeholderElement, imageSrc, dropdownId, container) {
  // Set loading state
  imageElement.setAttribute('data-loading', 'true');
  if (container) container.classList.remove('error', 'loaded');
  
  // Set image source
  imageElement.src = `images/${imageSrc}`;
  imageElement.alt = `Kit image: ${imageSrc.replace('.png', '')}`;
  
  // Handle image load success
  imageElement.onload = function() {
    console.log(`Image loaded successfully: ${imageSrc}`);
    
    // Remove loading state
    imageElement.removeAttribute('data-loading');
    
    // Hide placeholder with animation (only if placeholder is visible)
    if (placeholderElement.style.display !== 'none') {
      placeholderElement.classList.add('hide');
      
      // Show image after placeholder hides
      setTimeout(() => {
        placeholderElement.style.display = 'none';
        showImageWithReveal(imageElement, container, dropdownId, imageSrc);
      }, 400);
    } else {
      // Placeholder already hidden, show image immediately
      showImageWithReveal(imageElement, container, dropdownId, imageSrc);
    }
  };
  
  // Handle image load error
  imageElement.onerror = function() {
    console.error(`Failed to load image: ${imageSrc}`);
    
    // Remove loading state
    imageElement.removeAttribute('data-loading');
    
    // Add error state
    if (container) container.classList.add('error');
    
    // Update state
    imageDisplayStates[dropdownId] = {
      hasImage: false,
      currentImage: null
    };
    
    // Fallback to placeholder
    hideImage(imageElement, placeholderElement, dropdownId);
  };
}

/**
 * Show image with reveal animation
 * @param {Element} imageElement - The image element
 * @param {Element} container - The image container element
 * @param {string} dropdownId - The dropdown identifier
 * @param {string} imageSrc - The image source filename
 */
function showImageWithReveal(imageElement, container, dropdownId, imageSrc) {
  imageElement.style.display = 'block';
  imageElement.classList.add('reveal', 'visible');
  
  // Add loaded state to container
  if (container) container.classList.add('loaded');
  
  // Update state
  imageDisplayStates[dropdownId] = {
    hasImage: true,
    currentImage: imageSrc
  };
  
  // Remove animation class after animation completes
  setTimeout(() => {
    imageElement.classList.remove('reveal');
  }, 600);
}

/**
 * Hide image and show placeholder
 * @param {Element} imageElement - The image element
 * @param {Element} placeholderElement - The placeholder element
 * @param {string} dropdownId - The dropdown identifier
 */
function hideImage(imageElement, placeholderElement, dropdownId) {
  const container = imageElement.closest('.ai-card-image-container');
  
  // Hide image
  imageElement.style.display = 'none';
  imageElement.src = '';
  imageElement.classList.remove('visible', 'reveal');
  
  // Show placeholder with animation
  placeholderElement.style.display = 'flex';
  placeholderElement.classList.remove('hide');
  placeholderElement.classList.add('show');
  
  // Remove container states
  if (container) {
    container.classList.remove('error', 'loaded');
  }
  
  // Update state
  if (dropdownId && imageDisplayStates[dropdownId]) {
    imageDisplayStates[dropdownId] = {
      hasImage: false,
      currentImage: null
    };
  }
  
  // Remove animation class after animation completes
  setTimeout(() => {
    placeholderElement.classList.remove('show');
  }, 400);
}

/**
 * Reset all kit images to placeholder state
 */
function resetAllKitImages() {
  console.log('Resetting all kit images to placeholder state...');
  
  const imageConfigs = [
    { imageId: 'modelImage', placeholderId: 'modelImagePlaceholder', dropdownId: 'aiModelDropdown' },
    { imageId: 'kit1Image', placeholderId: 'kit1ImagePlaceholder', dropdownId: 'aiKit1Dropdown' },
    { imageId: 'kit2Image', placeholderId: 'kit2ImagePlaceholder', dropdownId: 'aiKit2Dropdown' }
  ];
  
  imageConfigs.forEach(config => {
    const imageElement = document.getElementById(config.imageId);
    const placeholderElement = document.getElementById(config.placeholderId);
    
    if (imageElement && placeholderElement) {
      hideImage(imageElement, placeholderElement, config.dropdownId);
    } else {
      console.warn(`Image elements not found for: ${config.imageId}`);
    }
  });
  
  // Reset dropdown text
  resetDropdownText();
  
  console.log('All kit images reset successfully');
}

/**
 * Reset dropdown text to default state
 */
function resetDropdownText() {
  const dropdownConfigs = [
    { id: 'aiModelDropdown', text: 'Select Model' },
    { id: 'aiKit1Dropdown', text: 'Select Kit 1' },
    { id: 'aiKit2Dropdown', text: 'Select Kit 2' }
  ];
  
  dropdownConfigs.forEach(config => {
    const trigger = document.querySelector(`[data-dropdown="${config.id}"]`);
    const dropdownText = trigger?.querySelector('.dropdown-text-ice');
    
    if (dropdownText) {
      dropdownText.textContent = config.text;
    }
  });
  
  // Clear all selected options
  const options = document.querySelectorAll('.dropdown-option-ice');
  options.forEach(option => option.classList.remove('selected'));
}

/**
 * Dropdown utility functions
 */
function openDropdown(dropdown, trigger) {
  dropdown.classList.add('open');
  trigger.classList.add('active');
  trigger.setAttribute('aria-expanded', 'true');
}

function closeDropdown(dropdown, trigger) {
  dropdown.classList.remove('open');
  trigger.classList.remove('active');
  trigger.setAttribute('aria-expanded', 'false');
}

function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll('.ai-dropdown-menu-ice');
  const triggers = document.querySelectorAll('.ai-dropdown-trigger-ice');
  
  dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
  triggers.forEach(trigger => {
    trigger.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Visual feedback for card selection
 */
function addCardFeedback(trigger) {
  const card = trigger.closest('.ai-game-card');
  if (!card) return;
  
  // Ice glow effect
  const isSpecial = card.classList.contains('ai-game-card-special');
  const glowColor = isSpecial ? 'rgba(0, 188, 212, 0.4)' : 'rgba(3, 169, 244, 0.4)';
  
  card.style.boxShadow = `0 16px 50px ${glowColor}, 0 8px 24px rgba(3, 169, 244, 0.3)`;
  card.style.transform = 'translateY(-2px)';
  card.style.transition = 'all 0.3s ease';
  
  // Reset after animation
  setTimeout(() => {
    card.style.boxShadow = '';
    card.style.transform = '';
  }, 500);
}

/**
 * Get current image state for debugging
 */
function getImageDisplayState() {
  return {
    states: imageDisplayStates,
    mapping: kitImageMapping
  };
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAIImageDisplay);
} else {
  // DOM is already ready
  initializeAIImageDisplay();
}

// Export functions for global access
if (typeof window !== 'undefined') {
  window.initializeAIImageDisplay = initializeAIImageDisplay;
  window.resetAllKitImages = resetAllKitImages;
  window.getImageDisplayState = getImageDisplayState;
  window.kitImageMapping = kitImageMapping;
}
