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
 * GLOBAL STATE & CONSTANTS
 ********************************************/
const PAGE_HOME = "HOME";
const PAGE_KIT_DETAIL = "KITDETAIL";
const PAGE_AR = "AR";
const PAGE_MANUALS = "MANUALS";
const PAGE_MODELS = "MODELS";

window.onload = function() {
  setupUI();
  showHomeScreen();  // Always start with home screen
  initScrollAnimations(); // Initialize scroll animations
  initVideoOptimization(); // Initialize video performance optimizations
};

function showHomeScreen(){
  // Hide all screens first
  document.getElementById("mainHeader").style.display = "flex";
  document.getElementById("homeScreen").style.display = "block";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.remove("active");
  
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
}

function showModelsScreen(){
  pauseAllVideos();
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("kitDetailScreen").style.display = "none";
  document.getElementById("arScreen").style.display = "none";
  document.getElementById("manualsScreen").classList.remove("active");
  document.getElementById("modelsScreen").classList.add("active");
}

function startARExperience(){
  // Hide the initial overlay
  document.getElementById("arInitialOverlay").classList.add("hidden");
  
  // Now initialize AR with camera
  if(!video) {
    initAR();
  }
}

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
  
  const pdfPath = `manuels/${manualNumber}.pdf`;
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

function downloadManual(kitType) {
  // Legacy function - redirect to openManual
  const manualMap = {
    'cam-a': '1',
    'cam-c': '2', 
    'crank': '3',
    'gear-a': '4',
    'gear-b': '5',
    'gear-c': '6'
  };
  
  if (manualMap[kitType]) {
    openManual(manualMap[kitType]);
  }
}

function downloadModel(modelNumber) {
  // Map model numbers to kit names for user feedback
  const kitNames = {
    '1': 'Cam-A 3D Model',
    '2': 'Cam-C 3D Model',
    '3': 'Crank 3D Model', 
    '4': 'Gear-A 3D Model',
    '5': 'Gear-B 3D Model',
    '6': 'Gear-C 3D Model'
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

// Legacy function for backward compatibility
function downloadModelLegacy(kitType) {
  const modelMap = {
    'cam-a': '1',
    'cam-c': '2',
    'crank': '3', 
    'gear-a': '4',
    'gear-b': '5',
    'gear-c': '6'
  };
  
  if (modelMap[kitType]) {
    downloadModel(modelMap[kitType]);
  } else {
    // Fallback to old alert system
    const kitNames = {
      'cam-a': 'Cam-A 3D Model',
      'cam-c': 'Cam-C 3D Model',
      'crank': 'Crank 3D Model',
      'gear-a': 'Gear-A 3D Model',
      'gear-b': 'Gear-B 3D Model',
      'gear-c': 'Gear-C 3D Model'
    };
    
    alert(`Downloading ${kitNames[kitType]}...\n\nThis would normally download an STL file that can be:\n• 3D printed for physical study\n• Imported into CAD software\n• Used for engineering analysis\n• Modified for custom applications`);
  }
}

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
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,

  // New scenario IDs (6–31):
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
  21: 0,
  22: 0,
  23: 0,
  24: 0,
  25: 0,
  26: 0,
  27: 0,
  28: 0,
  29: 0,
  30: 0,
  31: 0
};    
var SCENARIO_CONFIDENCE_THRESHOLD=3;
var stlLoader=null;
var stlCache={};
var lastFrameMarkers=[];

/* 
  Updated scenario objects with your new DESCRIPTIONS 
  Cam-A, Cam-C, Crank, Gear-A, Gear-B, Gear-C
*/
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
  },
  // 7th scenario (marker ID = 6)
  {
    name: "Octopus Baby Exotic T 0409195159",
    identifierTag: 6,
    desc: "An adorable baby exotic octopus, with texture from 0409195159.",
    objects: [
      {
        tag: 6,
        stl: "octopus_baby_exotic_t_0409195159_texture.stl"
      }
    ]
  },

  // 8th scenario (ID = 7)
  {
    name: "Octopus Exotic Tropic 0409194610",
    identifierTag: 7,
    desc: "A colorful tropical octopus from 0409194610.",
    objects: [
      {
        tag: 7,
        stl: "octopus_exotic_tropic_0409194610_texture.stl"
      }
    ]
  },

  {
    name: "Coral Reef Fish Uniqu 0409193350",
    identifierTag: 8,
    desc: "A unique coral reef fish (3350).",
    objects: [
      {
        tag: 8,
        stl: "coral_reef_fish_uniqu_0409193350_texture.stl"
      }
    ]
  },

  {
    name: "Marine Animal Exotic 0409191724",
    identifierTag: 9,
    desc: "An exotic marine creature, ID 1724.",
    objects: [
      {
        tag: 9,
        stl: "marine_animal_exotic__0409191724_texture.stl"
      }
    ]
  },

  {
    name: "Jellyfish Exotic Trop 0409193559",
    identifierTag: 10,
    desc: "An exotic tropical jellyfish, ID 3559.",
    objects: [
      {
        tag: 10,
        stl: "jellyfish_exotic_trop_0409193559_texture.stl"
      }
    ]
  },

  {
    name: "Marine Animal Exotic 0409191414",
    identifierTag: 11,
    desc: "Another exotic marine animal, ID 1414.",
    objects: [
      {
        tag: 11,
        stl: "marine_animal_exotic__0409191414_texture.stl"
      }
    ]
  },

  {
    name: "Jellyfish Exotic Trop 0409194017",
    identifierTag: 12,
    desc: "A second exotic jellyfish with texture ID 4017.",
    objects: [
      {
        tag: 12,
        stl: "jellyfish_exotic_trop_0409194017_texture.stl"
      }
    ]
  },

  {
    name: "Jellyfish Exotic Trop 0409193124",
    identifierTag: 13,
    desc: "A third jellyfish (3124).",
    objects: [
      {
        tag: 13,
        stl: "jellyfish_exotic_trop_0409193124_texture.stl"
      }
    ]
  },

  {
    name: "Pufferfish Lionfish 0409194030",
    identifierTag: 14,
    desc: "A hybrid puffer–lionfish (4030).",
    objects: [
      {
        tag: 14,
        stl: "pufferfish_lionfish_0409194030_texture.stl"
      }
    ]
  },

  {
    name: "Octopus 0409192644",
    identifierTag: 15,
    desc: "A second octopus, ID 2644.",
    objects: [
      {
        tag: 15,
        stl: "octopus_0409192644_texture.stl"
      }
    ]
  },

  {
    name: "Exotic Manta Ray Diff 0409192058",
    identifierTag: 16,
    desc: "An exotic manta ray (2058).",
    objects: [
      {
        tag: 16,
        stl: "exotic_manta_ray_diff_0409192058_texture.stl"
      }
    ]
  },

  {
    name: "Shark Manta Ray Diffe 0409190832",
    identifierTag: 17,
    desc: "A combo shark/manta ray, ID 0832.",
    objects: [
      {
        tag: 17,
        stl: "shark_manta_ray_diffe_0409190832_texture.stl"
      }
    ]
  },

  {
    name: "Exotic Manta Ray Diff 0409191733",
    identifierTag: 18,
    desc: "Another exotic manta ray (1733).",
    objects: [
      {
        tag: 18,
        stl: "exotic_manta_ray_diff_0409191733_texture.stl"
      }
    ]
  },

  {
    name: "Coral Reef Fish Uniqu 0409193604",
    identifierTag: 19,
    desc: "Coral reef fish (3604).",
    objects: [
      {
        tag: 19,
        stl: "coral_reef_fish_uniqu_0409193604_texture.stl"
      }
    ]
  },

  {
    name: "Extinct Fish Species 0409190726",
    identifierTag: 20,
    desc: "An extinct fish species (0726).",
    objects: [
      {
        tag: 20,
        stl: "extinct_fish_species__0409190726_texture.stl"
      }
    ]
  },

  {
    name: "Coral Reef Fish Uniqu 0409192753",
    identifierTag: 21,
    desc: "A second unique reef fish (2753).",
    objects: [
      {
        tag: 21,
        stl: "coral_reef_fish_uniqu_0409192753_texture.stl"
      }
    ]
  },

  {
    name: "Exotic Manta Ray Diff 0409191419",
    identifierTag: 22,
    desc: "An exotic manta ray (1419).",
    objects: [
      {
        tag: 22,
        stl: "exotic_manta_ray_diff_0409191419_texture.stl"
      }
    ]
  },

  {
    name: "Coral Reef Fish Uniqu 0409193118",
    identifierTag: 23,
    desc: "Yet another coral reef fish (3118).",
    objects: [
      {
        tag: 23,
        stl: "coral_reef_fish_uniqu_0409193118_texture.stl"
      }
    ]
  },

  {
    name: "Marine Animal Exotic 0409185056",
    identifierTag: 24,
    desc: "An exotic marine animal (5056).",
    objects: [
      {
        tag: 24,
        stl: "marine_animal_exotic__0409185056_texture.stl"
      }
    ]
  },

  {
    name: "Fish Exotic 0409185227",
    identifierTag: 25,
    desc: "A fish labeled 'exotic' (5227).",
    objects: [
      {
        tag: 25,
        stl: "fish_exotic_0409185227_texture.stl"
      }
    ]
  },

  {
    name: "Fish Tropical 0409184753",
    identifierTag: 26,
    desc: "A tropical fish (4753).",
    objects: [
      {
        tag: 26,
        stl: "fish_tropical_0409184753_texture.stl"
      }
    ]
  },

  {
    name: "Fish Tropical 0409184433",
    identifierTag: 27,
    desc: "Another tropical fish (4433).",
    objects: [
      {
        tag: 27,
        stl: "fish_tropical_0409184433_texture.stl"
      }
    ]
  },

  {
    name: "Marine Animal Exotic 0409190024",
    identifierTag: 28,
    desc: "Marine animal (0024).",
    objects: [
      {
        tag: 28,
        stl: "marine_animal_exotic__0409190024_texture.stl"
      }
    ]
  },

  {
    name: "Whale Different Speci 0409190151",
    identifierTag: 29,
    desc: "A whale, ID 0151.",
    objects: [
      {
        tag: 29,
        stl: "whale_different_speci_0409190151_texture.stl"
      }
    ]
  },

  {
    name: "Marine Animal Exotic 0409185506",
    identifierTag: 30,
    desc: "Another exotic sea creature (5506).",
    objects: [
      {
        tag: 30,
        stl: "marine_animal_exotic__0409185506_texture.stl"
      }
    ]
  },

  {
    name: "Fish Tropical 0409190013",
    identifierTag: 31,
    desc: "A final tropical fish, ID 0013.",
    objects: [
      {
        tag: 31,
        stl: "fish_tropical_0409190013_texture.stl"
      }
    ]
  }

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
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: "environment"  // This specifies the back camera
      } 
    })
    .then(function(stream){
      if("srcObject" in video){
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.play();
    })
    .catch(function(err){
      console.log("Camera error:", err);
    });
  }
}

function initRenderer(){
  // Calculate 16:9 dimensions that fit in viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const targetAspect = 16 / 9;
  const viewportAspect = viewportWidth / viewportHeight;
  
  let renderWidth, renderHeight;
  if (viewportAspect > targetAspect) {
      // Viewport wider than 16:9 - fit to height
      renderHeight = viewportHeight;
      renderWidth = Math.round(renderHeight * targetAspect);
  } else {
      // Viewport taller than 16:9 - fit to width  
      renderWidth = viewportWidth;
      renderHeight = Math.round(renderWidth / targetAspect);
  }
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(renderWidth, renderHeight);
  
  const threeContainer = document.getElementById("threeContainer");
  threeContainer.appendChild(renderer.domElement);
  
  videoTexture = new THREE.Texture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  
  backgroundScene = new THREE.Scene();
  backgroundCamera = new THREE.Camera();
  
  const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.68, 2.4),
      new THREE.MeshBasicMaterial({ map: videoTexture, depthTest: false, depthWrite: false })
  );
  plane.material.side = THREE.DoubleSide;
  plane.position.z = -1;
  backgroundScene.add(backgroundCamera);
  backgroundScene.add(plane);
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
      40,
      renderWidth / renderHeight, // This will be 16/9
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
}

// Resize handler to maintain 16:9
function handleResize() {
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
    
    renderer.setSize(renderWidth, renderHeight);
    camera.aspect = renderWidth / renderHeight;
    camera.updateProjectionMatrix();
    
    window.CV_RENDER_WIDTH = renderWidth;
    window.CV_RENDER_HEIGHT = renderHeight;
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


