/**
 * AutomatAR - Interactive Mechanical Engineering Learning Platform
 * Complete rewritten app.js with modular structure and proper error handling
 * Version 2.0 - Simplified AI System
 */

/********************************************
 * GLOBAL CONSTANTS AND STATE
 ********************************************/

const SCREENS = {
  HOME: "HOME",
  KIT_DETAIL: "KITDETAIL",
  AR: "AR",
  MANUALS: "MANUALS",
  MODELS: "MODELS",
  AI: "AI",
  CREATE: "CREATE"
};

// Global application state
const AppState = {
  currentScreen: SCREENS.HOME,
  selectedKit: null,
  arActive: false,
  videoManager: null,
  assemblySystem: null,
  createManager: null
};

window.AppState = AppState;

// Kit scenarios data
const scenarios = [
  {
    name: "Cam-A",
    identifierTag: 0,
    desc: `Cam-A illustrates how cams convert rotational motion into linear oscillatory motion. 
The cam's surface can be contoured (circular, elliptical, etc.) to create different motion 
in the follower as the cam rotates. The cam mechanism's ability to produce precise, complex 
motion from simple rotational input makes it invaluable in mechanical design.`,
    objects: [{ tag: 6, stl: "sea_models/stringray.stl" }]
  },
  {
    name: "Cam-C",
    identifierTag: 1,
    desc: `Cam-C illustrates how cams convert rotational motion to arranged, paused (intermittent) motion. 
It's a rotating drive wheel (driver) with a pin engaging slots in a driven wheel (Geneva wheel). 
This engagement causes precise timing & indexing. Between steps, the Geneva wheel remains locked 
in place.`,
    objects: [{ tag: 7, stl: "sea_models/jellyfish.stl" }]
  },
  {
    name: "Crank",
    identifierTag: 2,
    desc: `Crank kit illustrates how a crank mechanism converts rotational motion into linear reciprocating motion. 
A rotating arm (the crank) pushes/pulls a connecting rod, creating back-and-forth movement.`,
    objects: [{ tag: 8, stl: "sea_models/dolphin.stl" }]
  },
  {
    name: "Gear-A",
    identifierTag: 3,
    desc: `Gear-A demonstrates how bevel gears transfer rotational motion between perpendicular shafts, 
turning horizontal circular motion into vertical. Bevel gears have cone-shaped teeth meeting at 90°.`,
    objects: [{ tag: 9, stl: "sea_models/octopus.stl" }]
  },
  {
    name: "Gear-B",
    identifierTag: 4,
    desc: `Gear-B shows how gear alignment & shape affect torque/speed, even with a constant driver. 
The driver's turning changes load distribution, resulting in dynamic acceleration/deceleration.`,
    objects: [{ tag: 10, stl: "sea_models/fishes.stl" }]
  },
  {
    name: "Gear-C",
    identifierTag: 5,
    desc: `Gear-C is a worm gear system that converts rotational motion while significantly reducing speed & 
increasing torque. A screw-like worm drives a worm wheel, transferring motion at 90°.`,
    objects: [{ tag: 11, stl: "sea_models/sea_turtle.stl" }]
  }
];

// Extended scenarios for AR (including marine models)
const extendedScenarios = [
  ...scenarios,
  {
    name: "Octopus Baby Exotic T 0409195159",
    identifierTag: 15,
    desc: "An adorable baby exotic octopus, with texture from 0409195159.",
    objects: [{ tag:15, stl: "octopus_baby_exotic_t_0409195159_texture.stl" }]
  },
  {
    name: "Octopus Exotic Tropic 0409194610",
    identifierTag: 7,
    desc: "A colorful tropical octopus from 0409194610.",
    objects: [{ tag: 7, stl: "octopus_exotic_tropic_0409194610_texture.stl" }]
  },
  {
    name: "Coral Reef Fish Uniqu 0409193350",
    identifierTag: 8,
    desc: "A unique coral reef fish (3350).",
    objects: [{ tag: 8, stl: "coral_reef_fish_uniqu_0409193350_texture.stl" }]
  },
  {
    name: "Marine Animal Exotic 0409191724",
    identifierTag: 9,
    desc: "An exotic marine creature, ID 1724.",
    objects: [{ tag: 9, stl: "marine_animal_exotic__0409191724_texture.stl" }]
  },
  {
    name: "Jellyfish Exotic Trop 0409193559",
    identifierTag: 10,
    desc: "An exotic tropical jellyfish, ID 3559.",
    objects: [{ tag: 10, stl: "jellyfish_exotic_trop_0409193559_texture.stl" }]
  },
  // ... continuing through all 32 scenarios
  {
    name: "Fish Tropical 0409190013",
    identifierTag: 31,
    desc: "A final tropical fish, ID 0013.",
    objects: [{ tag: 31, stl: "fish_tropical_0409190013_texture.stl" }]
  }
];

/********************************************
 * UTILITY FUNCTIONS
 ********************************************/

class Utils {
  static $(id) {
    return document.getElementById(id);
  }

  static showElement(element) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.style.display = 'block';
  }

  static hideElement(element) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.style.display = 'none';
  }

  static addClass(element, className) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.classList.add(className);
  }

  static removeClass(element, className) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.classList.remove(className);
  }

  static scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  static log(message, type = 'info') {
    const styles = {
      info: 'color: #2196F3',
      success: 'color: #4CAF50',
      warning: 'color: #FF9800',
      error: 'color: #f44336'
    };
    console.log(`%c[AutomatAR] ${message}`, styles[type]);
  }
}

/********************************************
 * APPLE-STYLE ASSEMBLY/DISASSEMBLY ANIMATIONS
 ********************************************/

class AssemblyAnimationSystem {
  constructor() {
    this.elements = [];
    this.observer = null;
    this.currentAssembledSection = -1;
    this.init();
  }

  init() {
    this.setupElements();
    this.setupObserver();
    this.setupScrolling();
    Utils.log('Assembly Animation System initialized', 'success');
  }

  setupElements() {
    const sections = document.querySelectorAll('.kit-section');
    this.elements = Array.from(sections).map((section, index) => {
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
  }

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const elementIndex = this.elements.findIndex(el => el.section === entry.target);
        if (elementIndex === -1) return;

        const element = this.elements[elementIndex];
        const ratio = entry.intersectionRatio;
        element.lastRatio = ratio;

        if (ratio > 0.3 && ratio < 0.7) {
          this.assembleSection(element, elementIndex);
        } else if (ratio >= 0.1 && ratio <= 0.3 && !element.isAssembled) {
          this.assembleSection(element, elementIndex);
        } else if (ratio < 0.1 || ratio > 0.9) {
          this.disassembleSection(element, elementIndex);
        }
      });

      this.updateSectionTransitions();
    }, {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      rootMargin: '0px'
    });

    this.elements.forEach(element => {
      this.observer.observe(element.section);
    });
  }

  assembleSection(element, index) {
    if (element.isAssembled) return;
    
    element.isAssembled = true;
    this.currentAssembledSection = index;

    element.kitText.classList.remove('pre-assembly', 'disassembled');
    element.kitImage.classList.remove('pre-assembly', 'disassembled');

    setTimeout(() => element.kitText.classList.add('assembled'), 100);
    setTimeout(() => element.kitImage.classList.add('assembled'), 300);

    const video = element.kitImage.querySelector('.kit-video');
    if (video && video.paused && video.readyState >= 2) {
      video.play().catch(e => Utils.log('Video play failed', 'warning'));
    }
  }

  disassembleSection(element, index) {
    if (!element.isAssembled) return;
    
    element.isAssembled = false;
    
    element.kitText.classList.remove('assembled');
    element.kitImage.classList.remove('assembled');

    setTimeout(() => element.kitText.classList.add('disassembled'), 50);
    setTimeout(() => element.kitImage.classList.add('disassembled'), 150);

    setTimeout(() => {
      element.kitText.classList.remove('disassembled');
      element.kitImage.classList.remove('disassembled');
      element.kitText.classList.add('pre-assembly');
      element.kitImage.classList.add('pre-assembly');
    }, 800);

    const video = element.kitImage.querySelector('.kit-video');
    if (video && !video.paused) {
      video.pause();
    }
  }

  updateSectionTransitions() {
    let mostVisibleSection = -1;
    let highestRatio = 0;

    this.elements.forEach((element, index) => {
      if (element.lastRatio > highestRatio && element.lastRatio > 0.2) {
        highestRatio = element.lastRatio;
        mostVisibleSection = index;
      }
    });

    if (mostVisibleSection !== -1 && mostVisibleSection !== this.currentAssembledSection) {
      if (this.currentAssembledSection >= 0 && this.currentAssembledSection < this.elements.length) {
        const prevElement = this.elements[this.currentAssembledSection];
        if (Math.abs(this.currentAssembledSection - mostVisibleSection) > 1) {
          this.disassembleSection(prevElement, this.currentAssembledSection);
        }
      }
    }
  }

  setupScrolling() {
    window.addEventListener('scroll', this.handleParallax.bind(this), { passive: true });
    this.initSectionScrolling();
  }

  handleParallax() {
    const scrolled = window.pageYOffset;
    
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
      parallaxBg.style.transform = `translate3d(0, ${scrolled * -0.2}px, 0)`;
    }

    this.elements.forEach((element, index) => {
      if (element.isAssembled && element.lastRatio > 0.3) {
        const rect = element.section.getBoundingClientRect();
        const speed = (index % 2 === 0) ? 0.1 : -0.1;
        const yPos = rect.top * speed;
        
        if (element.kitImage && rect.top < window.innerHeight && rect.bottom > 0) {
          element.kitImage.style.transform = `translateZ(0) translateY(${yPos}px)`;
        }
      }
    });
  }

  initSectionScrolling() {
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
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
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

  reset() {
    this.elements.forEach(element => {
      element.isAssembled = false;
      element.lastRatio = 0;
      
      element.kitText.classList.remove('assembled', 'disassembled');
      element.kitImage.classList.remove('assembled', 'disassembled');
      element.kitText.classList.add('pre-assembly');
      element.kitImage.classList.add('pre-assembly');
    });
    this.currentAssembledSection = -1;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('scroll', this.handleParallax);
  }
}

/********************************************
 * VIDEO OPTIMIZATION FUNCTIONS
 ********************************************/

class VideoManager {
  constructor() {
    this.videos = new Map();
    this.observer = null;
    this.init();
  }

  init() {
    this.setupVideos();
    this.setupIntersectionObserver();
    Utils.log('Video Manager initialized', 'success');
  }

  setupVideos() {
    const videos = document.querySelectorAll('.kit-video, .kit-detail-video');
    videos.forEach(video => {
      video.setAttribute('loading', 'lazy');
      
      video.addEventListener('loadstart', () => {
        video.setAttribute('data-loading', 'true');
      });
      
      video.addEventListener('canplay', () => {
        video.removeAttribute('data-loading');
      });
      
      video.addEventListener('error', () => {
        Utils.log(`Video failed to load: ${video.src}`, 'error');
        this.handleVideoError(video);
      });

      this.videos.set(video, { playing: false, visible: false });
    });
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        const videoData = this.videos.get(video);
        
        if (!videoData) return;

        if (entry.isIntersecting) {
          videoData.visible = true;
          this.playVideo(video);
        } else {
          videoData.visible = false;
          this.pauseVideo(video);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });

    this.videos.forEach((_, video) => {
      this.observer.observe(video);
    });
  }

  playVideo(video) {
    const videoData = this.videos.get(video);
    if (video.paused && video.readyState >= 2 && !videoData.playing) {
      video.play().then(() => {
        videoData.playing = true;
      }).catch(e => {
        Utils.log(`Video autoplay failed: ${e.message}`, 'warning');
      });
    }
  }

  pauseVideo(video) {
    const videoData = this.videos.get(video);
    if (!video.paused && videoData.playing) {
      video.pause();
      videoData.playing = false;
    }
  }

  pauseAll() {
    this.videos.forEach((data, video) => {
      this.pauseVideo(video);
    });
  }

  resumeVisibleVideos() {
    this.videos.forEach((data, video) => {
      const rect = video.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && video.paused && video.readyState >= 2) {
        video.play().catch(e => Utils.log('Video resume failed', 'warning'));
      }
    });
  }

  handleVideoError(video) {
    video.style.display = 'none';
    const placeholder = video.nextElementSibling;
    if (placeholder && placeholder.classList.contains('placeholder-img')) {
      placeholder.style.display = 'block';
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.videos.clear();
  }
}

/********************************************
 * SCREEN MANAGEMENT SYSTEM
 ********************************************/

class ScreenManager {
  constructor() {
    this.screens = new Map();
    this.currentScreen = SCREENS.HOME;
    this.init();
  }

  init() {
    this.registerScreens();
    Utils.log('Screen Manager initialized', 'success');
  }

  registerScreens() {
    this.screens.set(SCREENS.HOME, {
      element: Utils.$('homeScreen'),
      show: () => this.showHomeScreen(),
      hide: () => this.hideHomeScreen()
    });

    this.screens.set(SCREENS.KIT_DETAIL, {
      element: Utils.$('kitDetailScreen'),
      show: (kitId) => this.showKitDetailScreen(kitId),
      hide: () => this.hideKitDetailScreen()
    });

    this.screens.set(SCREENS.AR, {
      element: Utils.$('arScreen'),
      show: () => this.showARScreen(),
      hide: () => this.hideARScreen()
    });

    this.screens.set(SCREENS.MANUALS, {
      element: Utils.$('manualsScreen'),
      show: () => this.showManualsScreen(),
      hide: () => this.hideManualsScreen()
    });

    this.screens.set(SCREENS.MODELS, {
      element: Utils.$('modelsScreen'),
      show: () => this.showModelsScreen(),
      hide: () => this.hideModelsScreen()
    });

    this.screens.set(SCREENS.AI, {
      element: Utils.$('aiScreen'),
      show: () => this.showAIScreen(),
      hide: () => this.hideAIScreen()
    });

    this.screens.set(SCREENS.CREATE, {
      element: Utils.$('createScreen'),
      show: () => this.showCreateScreen(),
      hide: () => this.hideCreateScreen()
    });
  }

  switchTo(screenName, ...args) {
    Utils.log(`Switching to screen: ${screenName}`);
    
    // Hide current screen
    const currentScreenData = this.screens.get(this.currentScreen);
    if (currentScreenData && currentScreenData.hide) {
      currentScreenData.hide();
    }

    // Show new screen
    const newScreenData = this.screens.get(screenName);
    if (newScreenData && newScreenData.show) {
      newScreenData.show(...args);
      this.currentScreen = screenName;
      AppState.currentScreen = screenName;
    } else {
      Utils.log(`Screen not found: ${screenName}`, 'error');
    }
  }

  hideAllScreens() {
    Utils.hideElement('mainHeader');
    Utils.hideElement('homeScreen');
    Utils.hideElement('kitDetailScreen');
    Utils.hideElement('arScreen');
    Utils.removeClass('manualsScreen', 'active');
    Utils.removeClass('modelsScreen', 'active');
    Utils.removeClass('aiScreen', 'active');
    Utils.removeClass('createScreen', 'active');
  }

  showHomeScreen() {
    this.hideAllScreens();
    Utils.showElement('mainHeader');
    Utils.showElement('homeScreen');
    
    Utils.scrollToTop();
    
    if (AppState.assemblySystem) {
      AppState.assemblySystem.reset();
    }
    
    setTimeout(() => {
      if (AppState.videoManager) {
        AppState.videoManager.resumeVisibleVideos();
      }
    }, 200);
  }

  hideHomeScreen() {
    if (AppState.videoManager) {
      AppState.videoManager.pauseAll();
    }
  }

  showKitDetailScreen(kitId) {
    this.hideAllScreens();
    
    const kit = scenarios[kitId];
    if (kit) {
      const titleEl = Utils.$('kit-detail-title');
      const descEl = Utils.$('kitDetailDesc');
      
      if (titleEl) titleEl.textContent = kit.name;
      if (descEl) descEl.textContent = kit.desc;

      const video = Utils.$('kitDetailVideo');
      if (video) {
        const source = video.querySelector('source');
        if (source) {
          source.src = `videos/kit${kitId + 1}.mp4`;
          video.load();
        }
        
        video.addEventListener('loadeddata', function() {
          const placeholder = Utils.$('kitDetailImg');
          if (placeholder) placeholder.style.display = 'none';
        });
      }
      
      AppState.selectedKit = kitId;
    }
    
    Utils.showElement('kitDetailScreen');
  }

  hideKitDetailScreen() {
    // Cleanup if needed
  }

  showARScreen() {
    this.hideAllScreens();
    Utils.showElement('arScreen');
    
    // Show initial overlay
    Utils.removeClass('arInitialOverlay', 'hidden');
  }

  hideARScreen() {
    // Cleanup AR resources if needed
    if (window.arManager) {
      window.arManager.cleanup();
    }
  }

  showManualsScreen() {
    this.hideAllScreens();
    Utils.addClass('manualsScreen', 'active');
  }

  hideManualsScreen() {
    // Cleanup if needed
  }

  showModelsScreen() {
    this.hideAllScreens();
    Utils.addClass('modelsScreen', 'active');
  }

  hideModelsScreen() {
    // Cleanup if needed
  }

  showAIScreen() {
    this.hideAllScreens();
    Utils.addClass('aiScreen', 'active');
  }

  hideAIScreen() {
    // Cleanup if needed
  }

  showCreateScreen() {
    this.hideAllScreens();
    Utils.addClass('createScreen', 'active');
    
    // Initialize create manager if not already done
    if (!AppState.createManager) {
      AppState.createManager = new CreateManager();
    }
    AppState.createManager.init();
  }

  hideCreateScreen() {
    if (AppState.createManager) {
      AppState.createManager.cleanup();
    }
  }
}

/********************************************
 * CREATE SCREEN MANAGER
 ********************************************/

class CreateManager {
  constructor() {
    this.stream = null;
    this.frames = [];
    this.isPlaying = false;
    this.currentFrame = 0;
    this.animSpeed = 500;
    this.animInterval = null;
    
    // Animation Library with Marker Support
    this.animationLibrary = new Map();
    this.animationCounter = 0;
    this.libraryButton = null;
    
    // Marker Detection
    this.detectedMarkers = [];
    this.markerHistory = new Map(); // Track markers over time
  }

  async init() {
    Utils.log('Initializing Create Manager with Marker Detection', 'info');
    
    // Setup in order
    this.createAnimationLibraryButton();
    await this.initCamera();
    this.setupControls();
    this.createSaveButton();
    this.initMarkerDetection();
    
    Utils.log('Create Manager ready with marker detection', 'success');
  }

  // Add this method to your CreateManager class
setupBackButton() {
  // Try multiple times to ensure button exists
  const attempts = 5;
  let currentAttempt = 0;
  
  const trySetupButton = () => {
    const backBtn = document.getElementById('closeCreateBtn');
    
    if (backBtn) {
      // Remove any existing handlers
      backBtn.onclick = null;
      backBtn.removeEventListener('click', this.backButtonHandler);
      
      // Create bound handler
      this.backButtonHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Back button clicked - cleaning up...');
        
        this.cleanup();
        
        // Try multiple navigation methods
        if (window.App && window.App.screenManager) {
          window.App.screenManager.switchTo('HOME');
        } else if (window.showHomeScreen) {
          window.showHomeScreen();
        } else {
          // Manual fallback
          document.getElementById('createScreen').style.display = 'none';
          document.getElementById('createScreen').classList.remove('active');
          document.getElementById('homeScreen').style.display = 'block';
        }
      };
      
      // Add event listener
      backBtn.addEventListener('click', this.backButtonHandler);
      console.log('Back button handler successfully attached');
      return true;
    } else {
      currentAttempt++;
      if (currentAttempt < attempts) {
        setTimeout(trySetupButton, 100);
      } else {
        console.error('Could not find back button after', attempts, 'attempts');
      }
      return false;
    }
  };
  
  // Start trying to setup the button
  trySetupButton();
}

// Also add this to your cleanup method
cleanup() {
  console.log('Cleaning up Create Manager...');
  
  // Stop camera
  if (this.stream) {
    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
  
  // Clear intervals
  clearInterval(this.animInterval);
  
  // Remove library button
  if (this.libraryButton && this.libraryButton.parentNode) {
    this.libraryButton.parentNode.removeChild(this.libraryButton);
    this.libraryButton = null;
  }
  
  // Remove back button handler
  const backBtn = document.getElementById('closeCreateBtn');
  if (backBtn && this.backButtonHandler) {
    backBtn.removeEventListener('click', this.backButtonHandler);
  }
  
  // Clear data
  this.frames = [];
  this.detectedMarkers = [];
  
  console.log('Create Manager cleaned up');
}

  initMarkerDetection() {
    // Initialize AR detector if available
    try {
      if (typeof AR !== 'undefined') {
        this.detector = new AR.Detector();
        Utils.log('Marker detector initialized', 'success');
      } else {
        Utils.log('AR library not available - marker detection disabled', 'warning');
      }
    } catch (error) {
      Utils.log(`Marker detection initialization failed: ${error.message}`, 'warning');
    }
  }

  // Create the persistent animation library button at the top
  // Inside CreateManager class, replace your existing method with this:
  createAnimationLibraryButton() {
    // 1) Remove any existing button first
    const existing = document.querySelector('#animLibraryTopBtn');
    if (existing) existing.remove();
  
    // 2) Find the create screen header
    const createScreen = document.getElementById('createScreen');
    if (!createScreen) return;
    const header = createScreen.querySelector('.modal-header');
    if (!header) return;
  
    // 3) Make header a flex container
    header.style.display        = 'flex';
    header.style.alignItems     = 'center';
    header.style.justifyContent = 'space-between';
  
    // 4) Add spacing to the Back button
    const backBtn = header.querySelector('#closeCreateBtn');
    if (backBtn) {
      backBtn.style.margin = '0 2rem 0 0';  // top 0, right 2rem, bottom 0, left 0
    }
  
    // 5) Create the “Animation Library” button
    this.libraryButton = document.createElement('button');
    this.libraryButton.id = 'animLibraryTopBtn';
    this.libraryButton.textContent = 'Animation Library';
  
    // 6) Push it to the far right with margin-left:auto
    this.libraryButton.style.cssText = `
      margin: 0 1rem 0 0;    /* top 0, right 1rem, bottom 0, left 0 */
      margin-left: auto;     /* ← pushes this button all the way to the right */
      background: #9C27B0;
      color: white;
      border: 2px solid #9C27B0;
      padding: 0.8rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
    `;
  
    // 7) Hover states
    this.libraryButton.onmouseenter = () => {
      this.libraryButton.style.background   = '#7B1FA2';
      this.libraryButton.style.transform    = 'translateY(-2px)';
      this.libraryButton.style.boxShadow    = '0 4px 12px rgba(156, 39, 176, 0.4)';
    };
    this.libraryButton.onmouseleave = () => {
      this.libraryButton.style.background   = '#9C27B0';
      this.libraryButton.style.transform    = 'translateY(0)';
      this.libraryButton.style.boxShadow    = '0 2px 8px rgba(156, 39, 176, 0.3)';
    };
    this.libraryButton.onclick = () => this.openLibrary();
  
    // 8) Append it as the last flex-child
    header.appendChild(this.libraryButton);
  
    Utils.log('Animation Library button created and positioned', 'success');
  }  


  updateLibraryButton() {
    if (this.libraryButton) {
      this.libraryButton.textContent = `Animation Library (${this.animationLibrary.size})`;
    }
  }

  async initCamera() {
    const video = Utils.$('createVideo');
    const status = Utils.$('createStatus');
    
    if (!video || !status) {
      Utils.log('Video or status element not found', 'error');
      return;
    }

    try {
      status.textContent = 'Starting camera...';
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      video.srcObject = this.stream;
      await video.play();
      
      status.textContent = 'Camera ready - Point at markers and capture';
      
      const captureBtn = Utils.$('createCapture');
      if (captureBtn) captureBtn.disabled = false;
      
    } catch (err) {
      status.textContent = 'Camera failed - Check permissions';
      Utils.log(`Camera error: ${err.message}`, 'error');
    }
  }

  setupControls() {
    // Main capture controls
    const captureBtn = Utils.$('createCapture');
    const clearBtn = Utils.$('createClear');
    const playBtn = Utils.$('createPlayPause');
    const resetBtn = Utils.$('createResetAnim');
    const speedSlider = Utils.$('createSpeedSlider');

    if (captureBtn) captureBtn.onclick = () => this.capture();
    if (clearBtn) clearBtn.onclick = () => this.clearAll();
    if (playBtn) playBtn.onclick = () => this.togglePlay();
    if (resetBtn) resetBtn.onclick = () => this.reset();
    if (speedSlider) speedSlider.oninput = () => this.updateSpeed();
  }

  createSaveButton() {
    const controls = document.querySelector('.create-animation-controls');
    if (!controls) return;

    // Remove existing save button
    const existing = controls.querySelector('#saveTolibBtn');
    if (existing) existing.remove();

    const saveBtn = document.createElement('button');
    saveBtn.id = 'saveToLibBtn';
    saveBtn.style.cssText = `
      background: #9C27B0;
      color: white;
      border: 2px solid #9C27B0;
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-left: 1rem;
      transition: all 0.3s ease;
      display: none;
    `;
    saveBtn.textContent = 'Save to Library';
    saveBtn.onclick = () => this.saveToLibrary();

    controls.appendChild(saveBtn);
  }

  detectMarkers(imageData) {
    if (!this.detector) return [];
    
    try {
      const markers = this.detector.detect(imageData);
      
      // Update marker history for confidence tracking
      markers.forEach(marker => {
        const id = marker.id;
        if (!this.markerHistory.has(id)) {
          this.markerHistory.set(id, { count: 0, lastSeen: Date.now() });
        }
        const history = this.markerHistory.get(id);
        history.count++;
        history.lastSeen = Date.now();
      });
      
      return markers;
    } catch (error) {
      Utils.log(`Marker detection failed: ${error.message}`, 'warning');
      return [];
    }
  }

capture() {
  const video = Utils.$('createVideo');
  const status = Utils.$('createStatus');
  
  if (!video || video.readyState < 2) {
    if (status) status.textContent = 'Camera not ready';
    return;
  }

  if (status) status.textContent = 'Capturing 3 golden squares from visible area...';

  try {
    // ✅ FIXED: Get the DISPLAYED video dimensions (what user actually sees)
    const videoRect = video.getBoundingClientRect();
    const displayWidth = video.clientWidth;   // Displayed width
    const displayHeight = video.clientHeight; // Displayed height
    
    // Calculate the visible area of the video (accounting for object-fit)
    const videoAspect = video.videoWidth / video.videoHeight;
    const displayAspect = displayWidth / displayHeight;
    
    let visibleWidth, visibleHeight, offsetX, offsetY;
    
    if (video.style.objectFit === 'cover' || displayAspect !== videoAspect) {
      // Video is likely cropped to fit container
      if (videoAspect > displayAspect) {
        // Video is wider - crop sides
        visibleHeight = video.videoHeight;
        visibleWidth = video.videoHeight * displayAspect;
        offsetX = (video.videoWidth - visibleWidth) / 2;
        offsetY = 0;
      } else {
        // Video is taller - crop top/bottom
        visibleWidth = video.videoWidth;
        visibleHeight = video.videoWidth / displayAspect;
        offsetX = 0;
        offsetY = (video.videoHeight - visibleHeight) / 2;
      }
    } else {
      // Video shows full frame
      visibleWidth = video.videoWidth;
      visibleHeight = video.videoHeight;
      offsetX = 0;
      offsetY = 0;
    }
    
    console.log('📹 Video Analysis:');
    console.log(`  Full video: ${video.videoWidth}×${video.videoHeight}`);
    console.log(`  Displayed: ${displayWidth}×${displayHeight}`);
    console.log(`  Visible area: ${Math.round(visibleWidth)}×${Math.round(visibleHeight)}`);
    console.log(`  Offset: (${Math.round(offsetX)}, ${Math.round(offsetY)})`);

    // Create capture canvas for full frame marker detection
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = video.videoWidth;
    fullCanvas.height = video.videoHeight;
    const fullCtx = fullCanvas.getContext('2d');
    fullCtx.drawImage(video, 0, 0);

    // Detect markers in full frame
    const imageData = fullCtx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
    const detectedMarkers = this.detectMarkers(imageData);
    
    this.detectedMarkers = detectedMarkers.map(marker => ({
      id: marker.id,
      corners: marker.corners,
      confidence: marker.confidence || 1,
      timestamp: Date.now()
    }));

    // ✅ FIXED: Calculate grid cells from VISIBLE area only
    const cellW = Math.floor(visibleWidth / 3);   // 3 columns from visible width
    const cellH = Math.floor(visibleHeight / 2);  // 2 rows from visible height
    
    // Golden cells are bottom row (what user actually sees)
    const goldenCells = [
      { col: 0, row: 1, name: 'Golden Square 1 (Bottom-Left)' },
      { col: 1, row: 1, name: 'Golden Square 2 (Bottom-Center)' },
      { col: 2, row: 1, name: 'Golden Square 3 (Bottom-Right)' }
    ];
    
    console.log('🎯 Capturing from visible viewport:');
    console.log(`  Grid cell size: ${Math.round(cellW)}×${Math.round(cellH)}`);
    
    // Capture each golden cell from the VISIBLE area
    goldenCells.forEach((cell, index) => {
      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = cellW;
      cellCanvas.height = cellH;
      const cellCtx = cellCanvas.getContext('2d');
      
      // ✅ FIXED: Calculate source position within VISIBLE area
      const sourceX = offsetX + (cell.col * cellW);  // Add offset to account for cropping
      const sourceY = offsetY + (cell.row * cellH);  // Add offset to account for cropping
      
      // Ensure we don't exceed video bounds
      const actualW = Math.min(cellW, video.videoWidth - sourceX);
      const actualH = Math.min(cellH, video.videoHeight - sourceY);
      
      // Clamp to visible area bounds
      const clampedW = Math.min(actualW, visibleWidth - (cell.col * cellW));
      const clampedH = Math.min(actualH, visibleHeight - (cell.row * cellH));
      
      // Draw ONLY the visible cell content
      cellCtx.drawImage(
        video,                    // Source video
        sourceX, sourceY,         // Source position (within visible area)
        clampedW, clampedH,       // Source size (clamped to visible bounds)
        0, 0,                    // Destination position
        cellW, cellH             // Destination size (scale to fill cell)
      );
      
      // Add golden border
      cellCtx.strokeStyle = '#FFD700';
      cellCtx.lineWidth = 3;
      cellCtx.strokeRect(0, 0, cellW, cellH);
      
      // Add indicator
      cellCtx.fillStyle = '#FFD700';
      cellCtx.font = 'bold 16px Arial';
      cellCtx.fillText(`G${index + 1}`, 10, 25);
      
      // Store the capture
      this.frames.push({
        id: this.frames.length,
        url: cellCanvas.toDataURL('image/png'),
        timestamp: Date.now(),
        cellIndex: index,
        cellName: cell.name,
        gridPosition: { col: cell.col, row: cell.row },
        sourceArea: { 
          x: Math.round(sourceX), 
          y: Math.round(sourceY), 
          width: Math.round(clampedW), 
          height: Math.round(clampedH)
        },
        visibleArea: {
          totalWidth: Math.round(visibleWidth),
          totalHeight: Math.round(visibleHeight),
          offset: { x: Math.round(offsetX), y: Math.round(offsetY) }
        },
        isComplete: true,
        isGoldenSquare: true,
        markers: this.detectedMarkers.slice()
      });
      
      console.log(`✅ Captured ${cell.name}:`);
      console.log(`   Grid: (${cell.col}, ${cell.row})`);
      console.log(`   Source: (${Math.round(sourceX)}, ${Math.round(sourceY)}) ${Math.round(clampedW)}×${Math.round(clampedH)}`);
      console.log(`   Visible bounds respected: ✓`);
    });

    this.updateDisplay();
    this.startAnimation();
    
    const markerInfo = detectedMarkers.length > 0 
      ? ` | Markers: ${detectedMarkers.map(m => m.id).join(', ')}`
      : '';
    
    if (status) status.textContent = `✅ Captured 3 golden squares from visible area${markerInfo}`;
    
    console.log(`🎉 Successfully captured golden squares from visible viewport only!`);
    
  } catch (err) {
    Utils.log(`Capture error: ${err.message}`, 'error');
    if (status) status.textContent = 'Capture failed';
    console.error('Capture error details:', err);
  }
}


  updateDisplay() {
    // Show sections
    Utils.showElement('createResultsSection');
    Utils.showElement('createAnimSection');
    Utils.showElement('createClear');
    
    // Show save button
    const saveBtn = Utils.$('saveToLibBtn');
    if (saveBtn) saveBtn.style.display = 'inline-block';
    
    // Update results
    this.renderFrames();
  }

  renderFrames() {
    const results = Utils.$('createResults');
    if (!results) return;

    results.innerHTML = '';

    // Marker summary section
    const markerSummary = this.createMarkerSummary();
    if (markerSummary) results.appendChild(markerSummary);

    // Create frame container
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
    `;

    // Add frames
    this.frames.forEach((frame, index) => {
      const frameDiv = document.createElement('div');
      frameDiv.style.cssText = `
        position: relative;
        cursor: pointer;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
      `;

      const img = document.createElement('img');
      img.src = frame.url;
      img.style.cssText = `
        width: 80px;
        height: 60px;
        object-fit: cover;
        display: block;
      `;

      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.8);
        color: white;
        font-size: 0.7rem;
        text-align: center;
        padding: 2px;
        font-weight: 600;
      `;
      label.textContent = index + 1;

      // Add marker indicator if frame has markers
      if (frame.markers && frame.markers.length > 0) {
        const markerBadge = document.createElement('div');
        markerBadge.style.cssText = `
          position: absolute;
          top: 2px;
          right: 2px;
          background: #FF9800;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        `;
        markerBadge.textContent = frame.markers.length;
        markerBadge.title = `Markers: ${frame.markers.map(m => m.id).join(', ')}`;
        frameDiv.appendChild(markerBadge);
      }

      frameDiv.onclick = () => this.downloadFrame(frame, index);
      frameDiv.onmouseenter = () => {
        frameDiv.style.borderColor = '#9C27B0';
        frameDiv.style.transform = 'scale(1.05)';
      };
      frameDiv.onmouseleave = () => {
        frameDiv.style.borderColor = 'rgba(255,255,255,0.3)';
        frameDiv.style.transform = 'scale(1)';
      };

      frameDiv.appendChild(img);
      frameDiv.appendChild(label);
      container.appendChild(frameDiv);
    });

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.style.cssText = `
      padding: 0.8rem 1.5rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      width: 100%;
      margin-top: 1rem;
      transition: all 0.3s ease;
    `;
    downloadBtn.textContent = `Download All ${this.frames.length} Frames`;
    downloadBtn.onclick = () => this.downloadAll();

    results.appendChild(container);
    results.appendChild(downloadBtn);
  }

  createMarkerSummary() {
    // Get all unique markers from all frames
    const allMarkers = new Set();
    this.frames.forEach(frame => {
      if (frame.markers) {
        frame.markers.forEach(marker => allMarkers.add(marker.id));
      }
    });

    if (allMarkers.size === 0) return null;

    const summary = document.createElement('div');
    summary.style.cssText = `
      background: rgba(255, 152, 0, 0.2);
      border: 1px solid rgba(255, 152, 0, 0.3);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      color: #FF9800;
      font-weight: 600;
      margin-bottom: 0.5rem;
    `;
    title.textContent = 'Detected Markers';

    const markerList = document.createElement('div');
    markerList.style.cssText = `
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    `;

    Array.from(allMarkers).sort((a, b) => a - b).forEach(markerId => {
      const badge = document.createElement('span');
      badge.style.cssText = `
        background: #FF9800;
        color: white;
        padding: 0.3rem 0.6rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
      `;
      badge.textContent = `ID: ${markerId}`;
      markerList.appendChild(badge);
    });

    summary.appendChild(title);
    summary.appendChild(markerList);
    return summary;
  }

  saveToLibrary() {
    if (this.frames.length === 0) return;

    const name = prompt('Enter animation name:', `Animation ${this.animationCounter + 1}`);
    if (!name) return;

    // Collect all unique marker IDs from frames
    const detectedTags = new Set();
    this.frames.forEach(frame => {
      if (frame.markers) {
        frame.markers.forEach(marker => detectedTags.add(marker.id));
      }
    });

    const animation = {
      id: ++this.animationCounter,
      name: name.trim(),
      frames: this.frames.map(f => ({
        url: f.url,
        timestamp: f.timestamp,
        cellIndex: f.cellIndex,
        markers: f.markers || []
      })),
      tags: Array.from(detectedTags).sort(), // Marker IDs associated with this animation
      metadata: {
        totalFrames: this.frames.length,
        frameRate: 1000 / this.animSpeed,
        createdAt: Date.now(),
        markerCount: detectedTags.size,
        captureSequences: Math.floor(this.frames.length / 4)
      }
    };

    this.animationLibrary.set(animation.id, animation);
    this.updateLibraryButton();
    
    const tagInfo = detectedTags.size > 0 
      ? ` with markers: ${Array.from(detectedTags).join(', ')}`
      : ' (no markers detected)';
    
    const status = Utils.$('createStatus');
    if (status) status.textContent = `"${name}" saved to library${tagInfo}`;
    
    Utils.log(`Animation "${name}" saved with ${detectedTags.size} marker tags`, 'success');
  }

  openLibrary() {
    this.createLibraryModal();
  }

  createLibraryModal() {
    // Remove existing
    const existing = document.getElementById('libModal');
    if (existing) existing.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'libModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0,0,0,0.9);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      color: white;
      overflow-y: auto;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(145deg, #9C27B0, #673AB7);
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    `;

    header.innerHTML = `
      <h2 style="margin: 0; font-size: 1.5rem;">Animation Library</h2>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <span style="background: rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: 16px; font-size: 0.9rem;">
          ${this.animationLibrary.size} saved
        </span>
        <button onclick="document.getElementById('libModal').remove()" 
                style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer;">
          Close
        </button>
      </div>
    `;

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    `;

    if (this.animationLibrary.size === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.7);">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📚</div>
          <h3 style="margin-bottom: 1rem;">No animations saved yet</h3>
          <p>Point camera at ArUco markers, capture frames, and save them to build your library.</p>
          <div style="background: rgba(255,152,0,0.2); border: 1px solid rgba(255,152,0,0.3); border-radius: 8px; padding: 1rem; margin-top: 1rem; font-size: 0.9rem;">
            <strong>Tip:</strong> Animations with detected markers will be tagged for easy organization and AR integration.
          </div>
        </div>
      `;
    } else {
      this.renderLibraryContent(content);
    }

    modal.appendChild(header);
    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  renderLibraryContent(container) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    `;

    this.animationLibrary.forEach(animation => {
      const card = this.createAnimCard(animation);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  createAnimCard(animation) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
      cursor: pointer;
    `;

    card.onmouseenter = () => {
      card.style.transform = 'translateY(-4px)';
      card.style.background = 'rgba(255,255,255,0.15)';
    };
    card.onmouseleave = () => {
      card.style.transform = 'translateY(0)';
      card.style.background = 'rgba(255,255,255,0.1)';
    };

    // Preview
    const preview = document.createElement('div');
    preview.style.cssText = `
      width: 100%;
      height: 120px;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      margin-bottom: 1rem;
      position: relative;
      overflow: hidden;
    `;

    if (animation.frames.length > 0) {
      const img = document.createElement('img');
      img.src = animation.frames[0].url;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      preview.appendChild(img);

      const playBtn = document.createElement('div');
      playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(156,39,176,0.8);
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      `;
      playBtn.innerHTML = '▶';
      playBtn.onclick = (e) => {
        e.stopPropagation();
        this.playFullscreen(animation);
      };
      preview.appendChild(playBtn);
    }

    // Info with marker tags
    const info = document.createElement('div');
    info.innerHTML = `
      <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">${animation.name}</h3>
      <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.8rem;">
        ${animation.frames.length} frames • ${Math.round(animation.metadata.frameRate)} FPS<br>
        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">
          ${new Date(animation.metadata.createdAt).toLocaleDateString()}
        </span>
      </div>
    `;

    // Add marker tags if any
    if (animation.tags && animation.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.style.cssText = `
        display: flex;
        gap: 0.3rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      `;

      animation.tags.forEach(tag => {
        const tagBadge = document.createElement('span');
        tagBadge.style.cssText = `
          background: #FF9800;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
        `;
        tagBadge.textContent = `ID:${tag}`;
        tagsContainer.appendChild(tagBadge);
      });

      info.appendChild(tagsContainer);
    } else {
      const noTags = document.createElement('div');
      noTags.style.cssText = `
        color: rgba(255,255,255,0.4);
        font-size: 0.8rem;
        margin-bottom: 1rem;
        font-style: italic;
      `;
      noTags.textContent = 'No markers detected';
      info.appendChild(noTags);
    }

    // Actions
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 0.5rem;
    `;

    const playBtn = document.createElement('button');
    playBtn.style.cssText = `
      flex: 1;
      background: #4CAF50;
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    `;
    playBtn.textContent = 'Play';
    playBtn.onclick = (e) => {
      e.stopPropagation();
      this.playFullscreen(animation);
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.style.cssText = `
      flex: 1;
      background: #2196F3;
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    `;
    downloadBtn.textContent = 'Download';
    downloadBtn.onclick = (e) => {
      e.stopPropagation();
      this.downloadAnimation(animation);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.style.cssText = `
      background: #f44336;
      color: white;
      border: none;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    `;
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteAnimation(animation.id);
    };

    actions.appendChild(playBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(preview);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }

  playFullscreen(animation) {
    const player = document.createElement('div');
    player.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0,0,0,0.95);
      z-index: 3000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    `;

    const controls = document.createElement('div');
    controls.style.cssText = `
      position: absolute;
      top: 2rem;
      background: rgba(0,0,0,0.8);
      padding: 1rem 2rem;
      border-radius: 8px;
      display: flex;
      gap: 1rem;
      align-items: center;
    `;

    const tagInfo = animation.tags && animation.tags.length > 0 
      ? ` • Tags: ${animation.tags.join(', ')}`
      : '';

    controls.innerHTML = `
      <h3 style="margin: 0; color: #9C27B0;">${animation.name}</h3>
      <span>${animation.frames.length} frames${tagInfo}</span>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
        Close
      </button>
    `;

    const img = document.createElement('img');
    img.style.cssText = `
      max-width: 80%;
      max-height: 70%;
      border-radius: 8px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    `;
    img.src = animation.frames[0].url;

    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % animation.frames.length;
      img.src = animation.frames[frame].url;
    }, 1000 / animation.metadata.frameRate);

    player.onclick = (e) => {
      if (e.target === player) {
        clearInterval(interval);
        player.remove();
      }
    };

    setTimeout(() => {
      clearInterval(interval);
      player.remove();
    }, (1000 / animation.metadata.frameRate) * animation.frames.length * 3);

    player.appendChild(controls);
    player.appendChild(img);
    document.body.appendChild(player);
  }

  downloadAnimation(animation) {
    // Download frames
    animation.frames.forEach((frame, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.download = `${animation.name}_frame_${index + 1}.png`;
        a.href = frame.url;
        a.click();
      }, index * 200);
    });

    // Download metadata with marker information
    setTimeout(() => {
      const metadata = {
        name: animation.name,
        id: animation.id,
        tags: animation.tags,
        metadata: animation.metadata,
        frameCount: animation.frames.length,
        markerData: animation.frames.map((frame, index) => ({
          frameNumber: index + 1,
          markers: frame.markers || [],
          cellIndex: frame.cellIndex
        })),
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${animation.name}_metadata.json`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, animation.frames.length * 200 + 500);
  }

  deleteAnimation(id) {
    const animation = this.animationLibrary.get(id);
    if (animation && confirm(`Delete "${animation.name}"?`)) {
      this.animationLibrary.delete(id);
      this.updateLibraryButton();
      
      const modal = document.getElementById('libModal');
      if (modal) {
        modal.remove();
        this.openLibrary();
      }
    }
  }

  // Rest of the animation control methods remain the same...
  startAnimation() {
    if (this.frames.length === 0) return;

    const animFrame = Utils.$('createAnimFrame');
    const overlay = Utils.$('createAnimOverlay');
    
    if (overlay) overlay.style.display = 'none';
    if (animFrame) animFrame.src = this.frames[0].url;

    this.currentFrame = 0;
    this.isPlaying = true;
    
    const playBtn = Utils.$('createPlayPause');
    if (playBtn) {
      playBtn.textContent = 'Pause';
      playBtn.disabled = false;
    }
    
    const resetBtn = Utils.$('createResetAnim');
    if (resetBtn) resetBtn.disabled = false;
    
    const speedSlider = Utils.$('createSpeedSlider');
    if (speedSlider) speedSlider.disabled = false;

    this.animInterval = setInterval(() => {
      if (this.isPlaying && this.frames.length > 0) {
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        if (animFrame) animFrame.src = this.frames[this.currentFrame].url;
      }
    }, this.animSpeed);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const playBtn = Utils.$('createPlayPause');
    if (playBtn) playBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
  }

  reset() {
    this.currentFrame = 0;
    this.isPlaying = false;
    
    const playBtn = Utils.$('createPlayPause');
    if (playBtn) playBtn.textContent = 'Play';
    
    const animFrame = Utils.$('createAnimFrame');
    if (animFrame && this.frames.length > 0) {
      animFrame.src = this.frames[0].url;
    }
  }

  updateSpeed() {
    const slider = Utils.$('createSpeedSlider');
    const display = Utils.$('createSpeedDisplay');
    
    if (slider) {
      this.animSpeed = parseInt(slider.value);
      if (display) display.textContent = this.animSpeed + 'ms';
      
      if (this.isPlaying) {
        clearInterval(this.animInterval);
        this.animInterval = setInterval(() => {
          if (this.isPlaying && this.frames.length > 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            const animFrame = Utils.$('createAnimFrame');
            if (animFrame) animFrame.src = this.frames[this.currentFrame].url;
          }
        }, this.animSpeed);
      }
    }
  }

  downloadFrame(frame, index) {
    const a = document.createElement('a');
    a.download = `frame_${index + 1}.png`;
    a.href = frame.url;
    a.click();
  }

  downloadAll() {
    this.frames.forEach((frame, index) => {
      setTimeout(() => {
        this.downloadFrame(frame, index);
      }, index * 200);
    });
  }

  clearAll() {
    // Stop animation
    clearInterval(this.animInterval);
    this.isPlaying = false;
    this.currentFrame = 0;
    this.frames = [];
    this.detectedMarkers = [];

    // Reset UI
    const results = Utils.$('createResults');
    if (results) results.innerHTML = '';
    
    const animFrame = Utils.$('createAnimFrame');
    if (animFrame) animFrame.src = '';
    
    const overlay = Utils.$('createAnimOverlay');
    if (overlay) overlay.style.display = 'flex';
    
    const playBtn = Utils.$('createPlayPause');
    if (playBtn) {
      playBtn.textContent = 'Play';
      playBtn.disabled = true;
    }
    
    const resetBtn = Utils.$('createResetAnim');
    if (resetBtn) resetBtn.disabled = true;
    
    const speedSlider = Utils.$('createSpeedSlider');
    if (speedSlider) speedSlider.disabled = true;

    // Hide sections
    Utils.hideElement('createResultsSection');
    Utils.hideElement('createAnimSection');
    Utils.hideElement('createClear');

    // Hide save button
    const saveBtn = Utils.$('saveToLibBtn');
    if (saveBtn) saveBtn/**
 * Brand New CreateManager - Clean and Simple
 * Persistent Animation Library with Top Button
 */
  }
}


/********************************************
 * PDF MANAGER
 ********************************************/

class PDFManager {
  static openManual(manualNumber) {
    const kitNames = {
      '1': 'Cam-A Rotational Motion Manual',
      '2': 'Cam-C Intermittent Motion Manual',
      '3': 'Crank Reciprocating Motion Manual',
      '4': 'Gear-A Bevel Gears Manual',
      '5': 'Gear-B Variable Speed Manual',
      '6': 'Gear-C Worm Gears Manual'
    };

    const pdfPath = `manuals/${manualNumber}.pdf`;
    const pdfFrame = Utils.$('pdfFrame');
    const pdfFallback = Utils.$('pdfFallback');
    const pdfDownloadLink = Utils.$('pdfDownloadLink');
    const pdfViewerTitle = Utils.$('pdf-viewer-title');
    const pdfViewerModal = Utils.$('pdfViewerModal');

    if (pdfViewerTitle) pdfViewerTitle.textContent = kitNames[manualNumber] || 'Manual Viewer';
    if (pdfFrame) pdfFrame.src = pdfPath;
    if (pdfDownloadLink) pdfDownloadLink.href = pdfPath;
    
    Utils.addClass('pdfViewerModal', 'active');

    if (pdfFrame) {
      pdfFrame.onload = function() {
        try {
          if (pdfFrame.contentDocument === null) {
            Utils.hideElement('pdfFrame');
            Utils.showElement('pdfFallback');
          } else {
            Utils.showElement('pdfFrame');
            Utils.hideElement('pdfFallback');
          }
        } catch (e) {
          Utils.hideElement('pdfFrame');
          Utils.showElement('pdfFallback');
        }
      };

      pdfFrame.onerror = function() {
        Utils.hideElement('pdfFrame');
        Utils.showElement('pdfFallback');
      };
    }

    Utils.log(`Opening manual: ${kitNames[manualNumber]}`, 'info');
  }

  static close() {
    Utils.removeClass('pdfViewerModal', 'active');
    const pdfFrame = Utils.$('pdfFrame');
    if (pdfFrame) pdfFrame.src = '';
    Utils.log('PDF viewer closed', 'info');
  }
}

/********************************************
 * MODEL DOWNLOAD MANAGER
 ********************************************/

class ModelManager {
  static downloadModel(modelNumber) {
    const kitNames = {
      'cam a': 'Cam-A 3D Model',
      'CAM-C (geneva stop)': 'Cam-C 3D Model',
      'crank': 'Crank 3D Model',
      'gear a': 'Gear-A 3D Model',
      'gear b': 'Gear-B 3D Model',
      'gear c': 'Gear-C 3D Model',
      'base v7': 'Base Platform Model'
    };

    const modelPath = `kits-stl/${modelNumber}.stl`;
    const kitName = kitNames[modelNumber] || '3D Model';

    fetch(modelPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const downloadLink = document.createElement('a');
          downloadLink.href = modelPath;
          downloadLink.download = `AutomatAR_${kitName.replace(/\s+/g, '_')}.stl`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          NotificationManager.show(`${kitName} downloaded successfully!`, 'success');
          Utils.log(`Downloaded: ${kitName}`, 'success');
        } else {
          NotificationManager.show(`${kitName} file not found. Please contact support.`, 'error');
        }
      })
      .catch(error => {
        Utils.log(`Download failed: ${error.message}`, 'error');
        NotificationManager.show('Download failed. Please check your connection and try again.', 'error');
      });
  }
}

/********************************************
 * NOTIFICATION MANAGER
 ********************************************/

class NotificationManager {
  static show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#FF9800',
      info: '#2196F3'
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
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

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

/********************************************
 * AR MANAGER
 ********************************************/


class ARManager {
  constructor() {
    // Core AR components
    this.video = null;
    this.canvas = null;
    this.context = null;
    this.detector = null;
    this.posit = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
    this.modelSize = 35.0;
    this.stlLoader = null;
    this.stlCache = new Map();
    
    // Detection and tracking
    this.lastFrameMarkers = [];
    this.scenarioConfidence = {};
    this.CONFIDENCE_THRESHOLD = 3;
    this.lastActiveIdentifierTag = null;
    
    // Filters
    this.adaptiveFilter = null;
    this.multiScaleDetector = null;
    this.opticalFlowTracker = null;
    this.useAdaptiveFilter = false;
    this.useMultiScale = false;
    this.useOpticalFlow = false;
    
    // ✅ INTEGRATED: 3D Animation System
    this.activeAnimations3D = new Map(); // markerId -> 3D animation state
    this.animationTextures = new Map(); // markerId -> texture data
    this.animationPlanes = new Map(); // markerId -> 3D mesh
    
    // ✅ NEW: 2D Overlay Animation System
    this.overlayContainer = null;
    this.activeOverlays = new Map(); // markerId -> 2D overlay state
    this.animationIntervals = new Map(); // markerId -> interval ID
  }

  async init() {
    if (this.isInitialized) return;

    try {
      this.initElements();
      this.initDetector();
      await this.initCamera();
      this.initRenderer();
      this.initSTLLoader();
      this.initOverlaySystem(); // ✅ NEW: Initialize 2D overlay system
      this.startRenderLoop();
      
      this.isInitialized = true;
      Utils.log('ARManager with Integrated Animation System initialized successfully', 'success');
    } catch (error) {
      Utils.log(`AR initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // ✅ NEW: Initialize 2D Overlay System
  initOverlaySystem() {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'arAnimationOverlay';
    this.overlayContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 15;
    `;
    
    const threeContainer = Utils.$('threeContainer');
    if (threeContainer) {
      threeContainer.appendChild(this.overlayContainer);
      Utils.log('2D Animation Overlay System initialized', 'success');
    }
  }

  initElements() {
    this.video = Utils.$('video');
    this.canvas = Utils.$('canvas');
    
    if (!this.video || !this.canvas) {
      throw new Error('AR video or canvas elements not found');
    }
    
    this.context = this.canvas.getContext('2d');
  }

  initDetector() {
    if (typeof AR === 'undefined' || typeof POS === 'undefined') {
      throw new Error('AR detection libraries not loaded');
    }
    
    this.detector = new AR.Detector();
    this.posit = new POS.Posit(this.modelSize, this.canvas.width);
    
    // Initialize adaptive filters if available
    if (typeof AdaptiveThresholdFilter !== 'undefined') {
      this.adaptiveFilter = new AdaptiveThresholdFilter({ 
        blockSize: 21, C: 5, useIntegralImage: true 
      });
    }
    
    if (typeof MultiScaleDetector !== 'undefined') {
      this.multiScaleDetector = new MultiScaleDetector({ 
        detector: this.detector, scales: [1.0, 0.5, 1.5], confidenceThreshold: 0.3 
      });
    }
    
    if (typeof OpticalFlowTracker !== 'undefined') {
      this.opticalFlowTracker = new OpticalFlowTracker({
        winSize: 15, maxError: 10000, maxMotion: 50, maxTrackedFrames: 30
      });
    }
    
    // Initialize scenario confidence tracking
    extendedScenarios.forEach(scenario => {
      this.scenarioConfidence[scenario.identifierTag] = 0;
    });
    
    for (let i = 6; i <= 31; i++) {
      this.scenarioConfidence[i] = 0;
    }
  }

  async initCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      this.video.srcObject = stream;
      await this.video.play();
      
      Utils.log('AR camera initialized', 'success');
    } catch (error) {
      throw new Error(`Camera access failed: ${error.message}`);
    }
  }

  initRenderer() {
    if (typeof THREE === 'undefined') {
      throw new Error('Three.js not loaded');
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetAspect = 16 / 9;
    const viewportAspect = viewportWidth / viewportHeight;
    
    let renderWidth, renderHeight;
    if (viewportAspect > targetAspect) {
      renderHeight = viewportHeight;
      renderWidth = Math.round(renderHeight * targetAspect);
    } else {
      renderWidth = viewportWidth;
      renderHeight = Math.round(renderWidth / targetAspect);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(renderWidth, renderHeight);

    const threeContainer = Utils.$('threeContainer');
    if (threeContainer) {
      threeContainer.appendChild(this.renderer.domElement);
    }

    // Setup video texture and background
    this.videoTexture = new THREE.Texture(this.video);
    this.videoTexture.minFilter = THREE.LinearFilter;

    this.backgroundScene = new THREE.Scene();
    this.backgroundCamera = new THREE.Camera();

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.68, 2.4),
      new THREE.MeshBasicMaterial({ 
        map: this.videoTexture, 
        depthTest: false, 
        depthWrite: false 
      })
    );
    plane.material.side = THREE.DoubleSide;
    plane.position.z = -1;
    this.backgroundScene.add(this.backgroundCamera);
    this.backgroundScene.add(plane);

    // Setup main scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, renderWidth / renderHeight, 1, 1000);
    this.scene.add(this.camera);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x666666);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

    window.CV_RENDER_WIDTH = renderWidth;
    window.CV_RENDER_HEIGHT = renderHeight;

    Utils.log('AR renderer initialized', 'success');
  }

  initSTLLoader() {
    if (typeof THREE.STLLoader === 'undefined') {
      Utils.log('STL Loader not available', 'warning');
      return;
    }
    this.stlLoader = new THREE.STLLoader();
  }

  startRenderLoop() {
    const render = () => {
      requestAnimationFrame(render);
      this.tick();
    };
    render();
  }

  tick() {
    if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) return;

    try {
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.videoTexture) this.videoTexture.needsUpdate = true;

      let markers = this.detector.detect(imageData);
      markers = this.processFilters(markers, imageData);

      this.updateScene(markers);
      this.updateAllAnimations(); // ✅ NEW: Update both 3D and 2D animations

      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.backgroundScene, this.backgroundCamera);
      this.renderer.render(this.scene, this.camera);

      this.lastFrameMarkers = markers.slice();
      this.updateDebugInfo(markers);
    } catch (error) {
      Utils.log(`AR render error: ${error.message}`, 'error');
    }
  }

  processFilters(markers, imageData) {
    let finalMarkers = markers.slice();
    
    if (this.useAdaptiveFilter && this.adaptiveFilter) {
      try {
        const processed = this.adaptiveFilter.process(imageData);
        const atf = this.detector.detect(processed);
        atf.forEach(m => {
          if (!this.markerExists(finalMarkers, m)) finalMarkers.push(m);
        });
      } catch (e) {
        Utils.log('Adaptive filter error', 'warning');
      }
    }
    
    if (this.useMultiScale && this.multiScaleDetector) {
      try {
        const ms = this.multiScaleDetector.detect(imageData);
        ms.forEach(m => {
          if (!this.markerExists(finalMarkers, m)) finalMarkers.push(m);
        });
      } catch (e) {
        Utils.log('Multi-scale detector error', 'warning');
      }
    }
    
    if (this.useOpticalFlow && this.opticalFlowTracker) {
      try {
        const ofm = this.opticalFlowTracker.track(imageData, finalMarkers);
        if (ofm && ofm.length > 0) finalMarkers = ofm;
      } catch (e) {
        Utils.log('Optical flow error', 'warning');
      }
    }
    
    return finalMarkers;
  }

  markerExists(list, marker) {
    return list.some(m => (m.id === marker.id && this.areMarkersClose(m, marker)));
  }

  areMarkersClose(m1, m2) {
    let c1 = { x: 0, y: 0 }, c2 = { x: 0, y: 0 };
    for (let i = 0; i < 4; i++) {
      c1.x += m1.corners[i].x; c1.y += m1.corners[i].y;
      c2.x += m2.corners[i].x; c2.y += m2.corners[i].y;
    }
    c1.x /= 4; c1.y /= 4; c2.x /= 4; c2.y /= 4;
    let dx = c1.x - c2.x, dy = c1.y - c2.y;
    return (Math.sqrt(dx * dx + dy * dy) < 20);
  }

  // ✅ ENHANCED: Get animation from CreateManager library
  getAnimationForMarker(markerId) {
    try {
      let library = null;
      
      if (AppState.createManager && AppState.createManager.animationLibrary) {
        library = AppState.createManager.animationLibrary;
      } else if (window.App && window.App.createManager && window.App.createManager.animationLibrary) {
        library = window.App.createManager.animationLibrary;
      }
      
      if (!library || library.size === 0) {
        return null;
      }
      
      // Find animation with matching tag
      for (let [animId, animation] of library) {
        if (animation.tags && Array.isArray(animation.tags)) {
          const hasMatch = animation.tags.some(tag => {
            return tag === markerId || 
                   tag === String(markerId) || 
                   Number(tag) === markerId ||
                   parseInt(tag) === parseInt(markerId);
          });
          
          if (hasMatch) {
            Utils.log(`Found animation "${animation.name}" for marker ${markerId}`, 'success');
            return animation;
          }
        }
      }
      
      return null;
    } catch (error) {
      Utils.log(`Error getting animation for marker ${markerId}: ${error.message}`, 'error');
      return null;
    }
  }

  // ✅ NEW: Start 2D overlay animation
  start2DAnimation(markerId, animation, marker) {
    // Stop existing animation if any
    this.stop2DAnimation(markerId);

    Utils.log(`Starting 2D animation "${animation.name}" for marker ${markerId}`, 'success');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'ar-animation-overlay';
    overlay.style.cssText = `
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      display: none;
      transition: all 0.3s ease;
    `;

    // Create image element for animation frames
    const img = document.createElement('img');
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    `;

    overlay.appendChild(img);
    this.overlayContainer.appendChild(overlay);

    // Store animation state
    const animState = {
      element: overlay,
      img: img,
      animation: animation,
      currentFrame: 0,
      marker: marker
    };

    this.activeOverlays.set(markerId, animState);

    // Start frame animation with interval
    const frameInterval = 1000 / (animation.metadata.frameRate || 2);
    const intervalId = setInterval(() => {
      this.updateOverlayFrame(markerId);
    }, frameInterval);

    this.animationIntervals.set(markerId, intervalId);

    // Position and show overlay
    this.positionOverlay(markerId, marker);
    this.updateOverlayFrame(markerId);
  }

  // ✅ NEW: Update 2D overlay frame
  updateOverlayFrame(markerId) {
    const animState = this.activeOverlays.get(markerId);
    if (!animState) return;

    // Move to next frame
    animState.currentFrame = (animState.currentFrame + 1) % animState.animation.frames.length;
    
    // Update image source
    const currentFrame = animState.animation.frames[animState.currentFrame];
    if (currentFrame && currentFrame.url) {
      animState.img.src = currentFrame.url;
    }
  }

  // ✅ NEW: Position 2D overlay at marker location
  positionOverlay(markerId, marker) {
    const animState = this.activeOverlays.get(markerId);
    if (!animState || !marker) return;

    try {
      // Calculate marker center in canvas coordinates
      const centerX = marker.corners.reduce((sum, c) => sum + c.x, 0) / 4;
      const centerY = marker.corners.reduce((sum, c) => sum + c.y, 0) / 4;

      // Convert to screen coordinates
      const container = Utils.$('threeContainer');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / this.canvas.width;
      const scaleY = rect.height / this.canvas.height;

      const screenX = centerX * scaleX;
      const screenY = centerY * scaleY;

      // Position overlay (centered on marker)
      animState.element.style.left = (screenX - 100) + 'px';
      animState.element.style.top = (screenY - 100) + 'px';
      animState.element.style.display = 'block';
      
    } catch (error) {
      animState.element.style.display = 'none';
    }
  }

  // ✅ NEW: Stop 2D animation
  stop2DAnimation(markerId) {
    // Clear interval
    const intervalId = this.animationIntervals.get(markerId);
    if (intervalId) {
      clearInterval(intervalId);
      this.animationIntervals.delete(markerId);
    }

    // Remove overlay element
    const animState = this.activeOverlays.get(markerId);
    if (animState) {
      animState.element.remove();
      this.activeOverlays.delete(markerId);
    }
  }

  updateScene(markers) {
    // Clear existing 3D objects (keep lights and camera)
    while (this.scene.children.length > 3) {
      this.scene.remove(this.scene.children[3]);
    }

    const markerMap = new Map();
    markers.forEach(marker => markerMap.set(marker.id, marker));

    // Stop animations for markers that are no longer visible
    for (let markerId of this.activeOverlays.keys()) {
      if (!markerMap.has(markerId)) {
        this.stop2DAnimation(markerId);
      }
    }

    // Update confidence for visible scenarios
    const visibleScenarioIDs = [];
    extendedScenarios.forEach(scenario => {
      if (markerMap.has(scenario.identifierTag)) {
        visibleScenarioIDs.push(scenario.identifierTag);
      }
    });

    // Update confidence tracking
    for (let sid in this.scenarioConfidence) {
      if (visibleScenarioIDs.includes(parseInt(sid))) {
        this.scenarioConfidence[sid]++;
      } else {
        this.scenarioConfidence[sid] = 0;
      }
    }

    // Find best scenario
    let bestScenarioID = null;
    let bestConfidence = 0;
    for (let sid in this.scenarioConfidence) {
      const confidence = this.scenarioConfidence[sid];
      if (confidence >= this.CONFIDENCE_THRESHOLD && confidence > bestConfidence) {
        bestConfidence = confidence;
        bestScenarioID = parseInt(sid);
      }
    }

    if (bestScenarioID !== null) {
      this.lastActiveIdentifierTag = bestScenarioID;
    }

    // Process each detected marker
    markers.forEach(marker => {
      const markerId = marker.id;
      
      // ✅ PRIORITY: Check for animations first
      const animation = this.getAnimationForMarker(markerId);
      
      if (animation) {
        // Display 2D animation overlay
        if (!this.activeOverlays.has(markerId)) {
          this.start2DAnimation(markerId, animation, marker);
        } else {
          // Update position for existing animation
          this.positionOverlay(markerId, marker);
          const animState = this.activeOverlays.get(markerId);
          if (animState) {
            animState.marker = marker;
          }
        }
      } else {
        // Fall back to 3D models if no animation
        const activeScenario = extendedScenarios.find(s => s.identifierTag === bestScenarioID);
        if (activeScenario) {
          activeScenario.objects.forEach(obj => {
            const scenarioMarker = markerMap.get(obj.tag);
            if (scenarioMarker && scenarioMarker.id === markerId) {
              this.placeObject(scenarioMarker, obj.stl);
            }
          });
        }
      }
    });

    // Update UI
    this.updateKitInfo(markers);
  }

  // ✅ NEW: Update all animations (both 3D and 2D)
  updateAllAnimations() {
    // Update 2D overlay positions for all active animations
    this.activeOverlays.forEach((animState, markerId) => {
      if (animState.marker) {
        this.positionOverlay(markerId, animState.marker);
      }
    });

    // Update any 3D animations if they exist
    this.activeAnimations3D.forEach((animState, markerId) => {
      if (animState.marker) {
        const plane = this.animationPlanes.get(markerId);
        if (plane) {
          this.positionPlaneAtMarker(plane, animState.marker);
        }
      }
    });
  }

  placeObject(marker, stlRelativePath) {
    if (!this.stlLoader) return;

    const stlFullPath = `models/${stlRelativePath}`;
    
    const corners = marker.corners.map(corner => ({
      x: corner.x - (this.canvas.width / 2),
      y: (this.canvas.height / 2) - corner.y
    }));

    const pose = this.posit.pose(corners);

    this.loadSTL(stlFullPath, (geometry) => {
      geometry.computeBoundingBox();
      const min = geometry.boundingBox.min;
      const max = geometry.boundingBox.max;
      const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
      const offset = center.clone().multiplyScalar(-1);

      if (geometry.isBufferGeometry) {
        geometry.translate(offset.x, offset.y, offset.z);
      } else {
        const mat = new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z);
        geometry.applyMatrix(mat);
      }

      const material = new THREE.MeshPhongMaterial({ color: 0xD4A574 });
      const mesh = new THREE.Mesh(geometry, material);

      const scaleFactor = 0.05 * this.modelSize * 0.02;
      mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

      const r = pose.bestRotation;
      mesh.rotation.x = -Math.asin(-r[1][2]);
      mesh.rotation.y = -Math.atan2(r[0][2], r[2][2]);
      mesh.rotation.z = Math.atan2(r[1][0], r[1][1]);

      mesh.position.x = pose.bestTranslation[0];
      mesh.position.y = pose.bestTranslation[1];
      mesh.position.z = -pose.bestTranslation[2];

      this.scene.add(mesh);
    });
  }

  loadSTL(path, callback) {
    if (this.stlCache.has(path)) {
      callback(this.stlCache.get(path));
      return;
    }

    this.stlLoader.load(path, (geometry) => {
      this.stlCache.set(path, geometry);
      callback(geometry);
    }, undefined, (error) => {
      Utils.log(`STL load failed: ${path}`, 'error');
    });
  }

  updateKitInfo(markers) {
    const kitNameEl = Utils.$('arKitName');
    const kitDescEl = Utils.$('arKitDesc');

    if (markers.length > 0) {
      const markerInfos = [];
      let animationCount = 0;
      let modelCount = 0;
      
      markers.forEach(marker => {
        const animation = this.getAnimationForMarker(marker.id);
        if (animation) {
          markerInfos.push(`Animation: "${animation.name}" (ID: ${marker.id})`);
          animationCount++;
        } else {
          const activeScenario = extendedScenarios.find(s => s.identifierTag === marker.id);
          if (activeScenario) {
            markerInfos.push(`Model: ${activeScenario.name} (ID: ${marker.id})`);
            modelCount++;
          } else {
            markerInfos.push(`Marker ID: ${marker.id}`);
            modelCount++;
          }
        }
      });

      if (kitNameEl) kitNameEl.textContent = markerInfos.join(', ');
      if (kitDescEl) {
        kitDescEl.textContent = `Displaying ${animationCount} animation(s) and ${modelCount} 3D model(s)`;
      }
    } else {
      if (kitNameEl) kitNameEl.textContent = 'No markers detected';
      if (kitDescEl) kitDescEl.textContent = 'Point your camera at a marker to see content';
    }
  }

  updateDebugInfo(markers) {
    const overlay = Utils.$('debugOverlay');
    if (!overlay || !overlay.classList.contains('visible')) return;

    const debugCanvas = Utils.$('debugCanvas');
    const markerInfo = Utils.$('markerInfo');
    
    if (debugCanvas) {
      const debugCtx = debugCanvas.getContext('2d');
      debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
      debugCtx.drawImage(this.canvas, 0, 0);

      debugCtx.strokeStyle = 'lime';
      debugCtx.lineWidth = 2;
      markers.forEach(marker => {
        const c = marker.corners;
        debugCtx.beginPath();
        debugCtx.moveTo(c[0].x, c[0].y);
        debugCtx.lineTo(c[1].x, c[1].y);
        debugCtx.lineTo(c[2].x, c[2].y);
        debugCtx.lineTo(c[3].x, c[3].y);
        debugCtx.closePath();
        debugCtx.stroke();

        debugCtx.fillStyle = 'yellow';
        debugCtx.font = '12px Arial';
        const animation = this.getAnimationForMarker(marker.id);
        const text = animation ? `ID:${marker.id} (ANIM)` : `ID:${marker.id}`;
        debugCtx.fillText(text, c[0].x, c[0].y - 5);
      });
    }

    if (markerInfo) {
      let text = markers.length === 0 ? 'No markers detected.\n' : '';
      text += `Active 2D animations: ${this.activeOverlays.size}\n`;
      markers.forEach(marker => {
        const animation = this.getAnimationForMarker(marker.id);
        if (animation) {
          text += `Marker ID ${marker.id} - Playing: "${animation.name}"\n`;
        } else {
          text += `Marker ID ${marker.id} - 3D Model\n`;
        }
      });
      markerInfo.textContent = text;
    }
  }

  startExperience() {
    Utils.addClass('arInitialOverlay', 'hidden');
    if (!this.isInitialized) {
      this.init().catch(error => {
        Utils.log(`Failed to start AR: ${error.message}`, 'error');
        NotificationManager.show('Failed to start AR experience', 'error');
      });
    }
  }

  toggleDebug() {
    const overlay = Utils.$('debugOverlay');
    if (overlay) {
      overlay.classList.toggle('visible');
      const canvas = Utils.$('canvas');
      if (canvas) {
        canvas.style.display = overlay.classList.contains('visible') ? 'block' : 'none';
      }
    }
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetAspect = 16 / 9;
    const viewportAspect = viewportWidth / viewportHeight;
    
    let renderWidth, renderHeight;
    if (viewportAspect > targetAspect) {
      renderHeight = viewportHeight;
      renderWidth = Math.round(renderHeight * targetAspect);
    } else {
      renderWidth = viewportWidth;
      renderHeight = Math.round(renderWidth / targetAspect);
    }
    
    this.renderer.setSize(renderWidth, renderHeight);
    this.camera.aspect = renderWidth / renderHeight;
    this.camera.updateProjectionMatrix();
    
    window.CV_RENDER_WIDTH = renderWidth;
    window.CV_RENDER_HEIGHT = renderHeight;
  }

  cleanup() {
    // Stop all 2D animations
    this.animationIntervals.forEach(intervalId => clearInterval(intervalId));
    this.animationIntervals.clear();
    this.activeOverlays.clear();
    
    // Remove overlay container
    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
    }

    // Stop 3D animations
    this.activeAnimations3D.clear();
    this.animationTextures.clear();
    this.animationPlanes.clear();

    // Stop camera
    if (this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Cleanup renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.stlCache.clear();
    this.isInitialized = false;
    
    Utils.log('ARManager with integrated animation system cleaned up', 'info');
  }
}
/********************************************
 * EVENT HANDLER MANAGER
 ********************************************/

class EventHandlerManager {
  static init() {
    this.setupNavigationHandlers();
    this.setupModalHandlers();
    this.setupARHandlers();
    this.setupKeyboardShortcuts();
    Utils.log('Event handlers initialized', 'success');
  }

  static setupNavigationHandlers() {
    // Main navigation buttons
    const handlers = [
      { id: 'createBtn', action: () => App.screenManager.switchTo(SCREENS.CREATE) },
      { id: 'manualsBtn', action: () => App.screenManager.switchTo(SCREENS.MANUALS) },
      { id: 'openARBtn', action: () => App.screenManager.switchTo(SCREENS.AR) },
      { id: 'modelsBtn', action: () => App.screenManager.switchTo(SCREENS.MODELS) },
      { id: 'aiBtn', action: () => App.screenManager.switchTo(SCREENS.AI) },
      
      // Back buttons
      { id: 'kitBackHomeBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'backHomeBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'closeManualsBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'closeModelsBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'closeCreateBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      
      // PDF viewer
      { id: 'closePdfViewer', action: () => PDFManager.close() }
    ];

    handlers.forEach(({ id, action }) => {
      const element = Utils.$(id);
      if (element) {
        element.onclick = action;
        Utils.log(`Handler set for ${id}`, 'success');
      } else {
        Utils.log(`Element not found: ${id}`, 'warning');
      }
    });

    // Handle AI close button by class since it might not have an ID
    const aiCloseButton = document.querySelector('.ai-close-button');
    if (aiCloseButton) {
      aiCloseButton.onclick = () => {
        Utils.log('AI close button clicked');
        App.screenManager.switchTo(SCREENS.HOME);
      };
      Utils.log('AI close button handler set', 'success');
    } else {
      Utils.log('AI close button not found', 'warning');
    }

    // Also check for the closeAI function referenced in HTML
    window.closeAI = () => {
      Utils.log('closeAI function called');
      App.screenManager.switchTo(SCREENS.HOME);
    };

    // Make showAIScreen globally available
    window.showAIScreen = () => {
      App.screenManager.switchTo(SCREENS.AI);
    };
  }

  static setupModalHandlers() {
    // Close modals when clicking outside
    const modals = [
      { id: 'pdfViewerModal', closeAction: () => PDFManager.close() },
      { id: 'createScreen', closeAction: () => App.screenManager.switchTo(SCREENS.HOME) }
    ];

    modals.forEach(({ id, closeAction }) => {
      const modal = Utils.$(id);
      if (modal) {
        modal.onclick = function(e) {
          if (e.target === this) {
            closeAction();
          }
        };
      }
    });
  }

  static setupARHandlers() {
    const arHandlers = [
      { id: 'arStartButton', action: () => App.arManager.startExperience() },
      { id: 'debugSideBtn', action: () => App.arManager.toggleDebug() },
      { id: 'arHelpBtn', action: () => this.toggleARHelp() },
      { id: 'arInstructionsClose', action: () => this.toggleARHelp() }
    ];

    arHandlers.forEach(({ id, action }) => {
      const element = Utils.$(id);
      if (element) {
        element.onclick = action;
      }
    });
  }

  static setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'h':
        case 'H':
          if (e.ctrlKey || e.metaKey) return;
          App.screenManager.switchTo(SCREENS.HOME);
          break;
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) return;
          App.screenManager.switchTo(SCREENS.AR);
          break;
        case 'Escape':
          this.handleEscape();
          break;
      }
    });
  }

  static handleEscape() {
    // Close any open modals or return to home
    if (Utils.$('pdfViewerModal').classList.contains('active')) {
      PDFManager.close();
    } else if (App.screenManager.currentScreen !== SCREENS.HOME) {
      App.screenManager.switchTo(SCREENS.HOME);
    }
  }

  static toggleARHelp() {
    const overlay = Utils.$('arInstructionsOverlay');
    if (overlay) {
      overlay.classList.toggle('visible');
    }
  }
}

/********************************************
 * MAIN APPLICATION CLASS
 ********************************************/

class AutomatARApp {
  constructor() {
    this.screenManager = null;
    this.videoManager = null;
    this.assemblySystem = null;
    this.arManager = null;
    this.createManager = null;
    this.isInitialized = false;
  }

  async init() {
  if (this.isInitialized) return;

  try {
    Utils.log('Initializing AutomatAR Application...', 'info');
    
    // Initialize core systems
    this.screenManager = new ScreenManager();
    this.videoManager = new VideoManager();
    this.assemblySystem = new AssemblyAnimationSystem();
    this.arManager = new ARManager();
    
    // CRITICAL FIX: Initialize CreateManager immediately for AR animation support
    this.createManager = new CreateManager();
    AppState.createManager = this.createManager;
    
    // Store references in global state
    AppState.videoManager = this.videoManager;
    AppState.assemblySystem = this.assemblySystem;
    
    // Set up event handlers
    EventHandlerManager.init();
    
    // Start with home screen
    this.screenManager.switchTo(SCREENS.HOME);
    
    // Make functions globally available
    this.setupGlobalFunctions();
    
    // Setup window resize handler for AR
    window.addEventListener('resize', () => {
      if (this.arManager) {
        this.arManager.handleResize();
      }
    });
    
    this.isInitialized = true;
    Utils.log('AutomatAR Application initialized successfully!', 'success');
    
  } catch (error) {
    Utils.log(`Application initialization failed: ${error.message}`, 'error');
    NotificationManager.show('Application failed to initialize', 'error');
  }
}

  setupGlobalFunctions() {
    // Make core functions globally available for backward compatibility
    window.showHomeScreen = () => this.screenManager.switchTo(SCREENS.HOME);
    window.showKitDetail = (kitId) => this.screenManager.switchTo(SCREENS.KIT_DETAIL, kitId);
    window.showARScreen = () => this.screenManager.switchTo(SCREENS.AR);
    window.showManualsScreen = () => this.screenManager.switchTo(SCREENS.MANUALS);
    window.showModelsScreen = () => this.screenManager.switchTo(SCREENS.MODELS);
    window.showAIScreen = () => this.screenManager.switchTo(SCREENS.AI);
    window.showCreateScreen = () => this.screenManager.switchTo(SCREENS.CREATE);
    
    // Manual and model functions
    window.openManual = (manualNumber) => PDFManager.openManual(manualNumber);
    window.downloadModel = (modelNumber) => ModelManager.downloadModel(modelNumber);
    
    // AR functions
    window.startARExperience = () => this.arManager.startExperience();
    window.toggleDebugOverlay = () => this.arManager.toggleDebug();
    
    // Legacy AR initialization function
    window.initAR = () => this.arManager.init();
    
    // Legacy functions for compatibility
    window.downloadManual = (kitType) => {
      const manualMap = {
        'cam-a': '1', 'cam-c': '2', 'crank': '3',
        'gear-a': '4', 'gear-b': '5', 'gear-c': '6'
      };
      if (manualMap[kitType]) {
        PDFManager.openManual(manualMap[kitType]);
      }
    };
    
    // AI interface functions (simplified)
    window.closeAI = () => this.screenManager.switchTo(SCREENS.HOME);
    
    // Create screen functions
    window.cleanupCreateCamera = () => {
      if (this.createManager) {
        this.createManager.cleanup();
      }
    };
    
    // Scroll animations initialization
    window.initScrollAnimations = () => {
      if (this.assemblySystem) {
        this.assemblySystem.reset();
      }
    };
    
    // Video optimization functions
    window.initVideoOptimization = () => {
      Utils.log('Video optimization already handled by VideoManager', 'info');
    };
    
    window.pauseAllVideos = () => {
      if (this.videoManager) {
        this.videoManager.pauseAll();
      }
    };
    
    window.resumeVisibleVideos = () => {
      if (this.videoManager) {
        this.videoManager.resumeVisibleVideos();
      }
    };
    
    // Original setupUI function for compatibility
    window.setupUI = () => {
      Utils.log('UI setup already handled by EventHandlerManager', 'info');
    };
    
    // Toggle AR instructions overlay
    window.toggleARInstructionsOverlay = () => {
      EventHandlerManager.toggleARHelp();
    };
    
    Utils.log('Global functions setup complete', 'success');
  }

  destroy() {
    if (this.videoManager) this.videoManager.destroy();
    if (this.assemblySystem) this.assemblySystem.destroy();
    if (this.arManager) this.arManager.cleanup();
    if (this.createManager) this.createManager.cleanup();
    
    Utils.log('Application destroyed', 'info');
  }
}

/********************************************
 * APPLICATION BOOTSTRAP AND COMPATIBILITY
 ********************************************/

// Global app instance
const App = new AutomatARApp();



// Legacy AR functions for compatibility
function initAR() {
  App.arManager.init();
}

function startARExperience() {
  App.arManager.startExperience();
}

function toggleDebugOverlay() {
  App.arManager.toggleDebug();
}

// Legacy screen functions
function showHomeScreen() {
  App.screenManager.switchTo(SCREENS.HOME);
}

function showKitDetailScreen(kitID) {
  App.screenManager.switchTo(SCREENS.KIT_DETAIL, kitID);
}

function showKitDetail(kitID) {
  App.screenManager.switchTo(SCREENS.KIT_DETAIL, kitID);
}

function showARScreen() {
  App.screenManager.switchTo(SCREENS.AR);
}

function showManualsScreen() {
  App.screenManager.switchTo(SCREENS.MANUALS);
}

function showModelsScreen() {
  App.screenManager.switchTo(SCREENS.MODELS);
}

function showAIScreen() {
  App.screenManager.switchTo(SCREENS.AI);
}

function showCreateScreen() {
  this.hideAllScreens();
  Utils.addClass('createScreen', 'active');
  
  // Use existing CreateManager instead of creating new one
  if (AppState.createManager) {
    AppState.createManager.init();
  } else {
    Utils.log('CreateManager not available - this should not happen', 'error');
  }
}

// Legacy utility functions
function openManual(manualNumber) {
  PDFManager.openManual(manualNumber);
}

function closePdfViewer() {
  PDFManager.close();
}

function downloadModel(modelNumber) {
  ModelManager.downloadModel(modelNumber);
}

function downloadManual(kitType) {
  const manualMap = {
    'cam-a': '1', 'cam-c': '2', 'crank': '3',
    'gear-a': '4', 'gear-b': '5', 'gear-c': '6'
  };
  if (manualMap[kitType]) {
    PDFManager.openManual(manualMap[kitType]);
  }
}

// Legacy video functions
function pauseAllVideos() {
  if (App.videoManager) {
    App.videoManager.pauseAll();
  }
}

function resumeVisibleVideos() {
  if (App.videoManager) {
    App.videoManager.resumeVisibleVideos();
  }
}

function initVideoOptimization() {
  Utils.log('Video optimization handled by VideoManager', 'info');
}

// Legacy animation functions
function initScrollAnimations() {
  if (App.assemblySystem) {
    App.assemblySystem.reset();
  }
}

function initAssemblyAnimations() {
  Utils.log('Assembly animations handled by AssemblyAnimationSystem', 'info');
}

// Legacy create screen functions
function cleanupCreateCamera() {
  if (App.createManager) {
    App.createManager.cleanup();
  }
}

function captureAssemblyStep() {
  if (App.createManager) {
    App.createManager.captureStep();
  }
}

function clearAllCreateFrames() {
  if (App.createManager) {
    App.createManager.clearFrames();
  }
}

function toggleCreateAnimation() {
  if (App.createManager) {
    App.createManager.toggleAnimation();
  }
}

function resetCreateAnimation() {
  if (App.createManager) {
    App.createManager.resetAnimation();
  }
}

function updateCreateAnimationSpeed() {
  if (App.createManager) {
    App.createManager.updateSpeed();
  }
}

// Legacy AR instructions function
function toggleARInstructionsOverlay() {
  EventHandlerManager.toggleARHelp();
}

// Legacy AI functions (simplified)
function closeAI() {
  App.screenManager.switchTo(SCREENS.HOME);
}

// Legacy setup function
function setupUI() {
  Utils.log('UI setup handled by EventHandlerManager', 'info');
}

// Initialize when DOM is ready or immediately if already loaded
function initializeApplication() {
  // Set up legacy window.onload behavior
  window.onload = function() {
    App.init();
  };
  
  // If document is already ready, initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
}

// Handle page unload
window.addEventListener('beforeunload', () => App.destroy());

// Make app globally available for debugging
window.AutomatAR = App;
window.App = App;

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    AutomatARApp, 
    Utils, 
    SCREENS, 
    ScreenManager, 
    VideoManager, 
    AssemblyAnimationSystem,
    CreateManager,
    ARManager,
    PDFManager,
    ModelManager,
    NotificationManager,
    EventHandlerManager
  };
}

// Start the application
initializeApplication();

Utils.log('AutomatAR Application fully loaded - Simplified AI System', 'success');
