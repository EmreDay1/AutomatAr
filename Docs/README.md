## **Table of Contents**
---
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Component Descriptions](#component-descriptions)
- [Code Breakdown](#code-breakdown)
- [Contributors](#contributors)
- [Copyright](#copyright)
## Overview
---
Mechanical systems are fundamental to engineering and robotics, yet many K-12 students struggle to bridge the gap between theoretical knowledge and practical application. In order to bridge this gap and allow them to apply the necessary skill sets that are embedded within STEM areas we created the Automata Kits, covering areas from 3D design, mechanics, to augmented reality. Mechanical systems or figures that mimic any motion found in nature, especially human motions, continue to entertain us and capture our imagination. We created a bridge between mechanics and technology by integrating our kits with augmented reality (AR). Our kits consist of eight models, each reflecting a fundamental mechanical principle such as gears, cams and crank systems. These models, which are designed and 3D printed by us, and the research towards it develops a better understanding in mechanical systems and creates interest when integrating augmented reality (AR) elements. This dual integration of AR aims to create more interactivity and enhance comprehension, particularly in complex mechanical systems.

## Project Structure
---
AutomataAr/
|── src/
	├── MultiTagSystem.js
	├── aruco.js
	├── atf.js
	├── bilateral.js
	├── cv.js
	├── debug-posit.html
	├── edge.js
	├── ekf.js
	├── kalman.js
	├── multiS.js
	├── optic.js
	├── posit1.js
	├── posit2.js
	├── svd.js
|── Docs/
	└── README.md
|──README.md                

## Component Descriptions
---
### `MultiTagSystem.js`

Implements a **Multi-Tag Pose Tracking System** for augmented reality applications. This is one of the core modules enabling robust, real-time tracking of **multiple AR markers** in a single scene. It intelligently blends several advanced techniques to enhance tracking accuracy and stability, even under challenging conditions such as partial occlusion or jittery inputs.

### `aruco.js`

Implements a **complete ARUCO Marker Detection Pipeline**. This file defines the `AR.Detector` class, which serves as the core for detecting fiducial markers in a camera feed. It converts images to grayscale, applies thresholding, extracts contours, identifies potential quadrilateral candidates, and verifies them as ARUCO markers through a bit pattern recognition process.

### `atf.js`

Implements an **Adaptive Threshold Filter (ATF)** for preprocessing image data in AR applications. This module enhances marker detection under **uneven lighting conditions** and **extreme viewing angles** by dynamically adjusting the binarization threshold based on local pixel neighborhoods instead of relying on a single global threshold.

### `bilateral.js`

Provides an **Edge-Preserving Bilateral Filter** for denoising image data in augmented reality (AR) applications. Designed to reduce noise from low-quality or unstable camera feeds without blurring important edges—especially useful for maintaining the integrity of AR marker borders.

### `cv.js`

Provides a complete **computer vision utility library** under the `CV` namespace, supporting low-level image processing tasks critical to augmented reality applications. This file forms the backbone of marker detection in the Automata AR system, enabling grayscale conversion, filtering, contour detection, polygon approximation, thresholding, and warping operations.

### `debug-posit.html`

A comprehensive **debug and visualization interface** for testing and tuning the entire marker detection and pose estimation pipeline in the Automata AR system. This HTML page integrates camera input, real-time detection, multi-view 3D rendering, and interactive debugging tools to facilitate system validation and optimization.

### `edge.js`

Implements an advanced **Edge-Enhanced Detection Module** that boosts AR marker recognition by integrating traditional feature detection with modern image analysis techniques. This component wraps around a base detector (like `AR.Detector`) to enhance marker visibility under extreme viewing angles, low contrast, or noisy conditions.

### `ekf.js`

Implements an advanced **Extended Kalman Filter (EKF)** tailored for **non-linear motion tracking** in AR environments—especially useful for dynamically changing or physically constrained systems such as crank mechanisms or free-falling objects.

### `kalman.js`

Implements a classic **linear Kalman Filter** for **smoothing 3D AR pose tracking**, particularly for **position and velocity**. It uses a 6D state vector `[x, y, z, vx, vy, vz]` and a 3D measurement vector `[x, y, z]`. The filter assumes a **constant velocity model** and is optimized for real-time performance in web-based AR scenes. It helps reduce jitter in marker tracking and ensures smoother transitions during motion by blending prediction and measurement updates efficiently.

### `multiS.js`

Adds **multi-scale detection** capability to AR marker recognition by wrapping an existing detector (e.g., `AR.Detector`). It performs detection at multiple image scales (default: `[1.0, 0.5, 2.0]`) to improve robustness under challenging conditions such as **motion blur**, **distance variation**, or **low resolution**. By intelligently rescaling input and recombining results, this module significantly boosts detection rates for small, far, or distorted markers.

### `optic.js`

Provides **optical flow-based marker tracking** for AR applications using a simplified **Lucas-Kanade (L-K)** method. It tracks marker corners between frames when markers are momentarily lost due to **motion blur**, **rapid movement**, or **occlusion**. This helps maintain tracking continuity by estimating movement from past frames, offering fallback robustness when direct marker detection fails.

### `posit1.js`

Implements the **POS/IT algorithm** for **pose estimation** from coplanar points in AR. Based on the paper _"Iterative Pose Estimation using Coplanar Feature Points"_, it computes both **rotation** and **translation** from 2D image points and a known 3D model. This allows accurate 3D object alignment even from a single frame, making it ideal for fast AR marker pose recovery.

### `posit2.js`

Implements an improved version of the **POS/IT algorithm** for **3D pose estimation** using coplanar feature points. It leverages linear algebra with matrix-vector operations and **Singular Value Decomposition (SVD)** to calculate accurate **rotation** and **translation** of a known model from 2D image projections. This variant emphasizes numerical stability and modular vector/matrix operations (`Vec3`, `Mat3`), providing two pose solutions and refining them through iterative angle-based error minimization.

### `svd.js`

Provides a JavaScript implementation of the **Singular Value Decomposition (SVD)** algorithm, adapted from _Numerical Recipes in C_. It factorizes a matrix into three components—U, W (diagonal), and Vᵗ—enabling robust solutions for systems like pose estimation, pseudoinverses, and numerical optimization. Used internally by POS/IT implementations for stability in linear equations, especially in under- or over-constrained systems.

## Code Breakdown

### `MultiTagSystem.js`
#### `MultiMarkerSystem`

This class manages a system of multiple AR markers with known spatial relationships. It takes in a marker size and camera calibration data, and allows you to:
- Add known markers with predefined global poses.
- Use detected markers in a camera frame to estimate the global pose of the camera.
- Internally handles transformation matrix math (inversion, multiplication, averaging).
- Uses the POSIT algorithm to estimate individual marker poses, then combines multiple marker poses for a more stable global estimate.    

The class relies on accurate marker placement and detection to provide reliable pose tracking in multi-marker AR systems.

### `aruco.js`
#### `AR.Detector`

This class is responsible for detecting square-shaped AR markers in a given image.

- It processes a binary or thresholded image and looks for contours that match square marker shapes.
- Uses the `AR.Marker` class to validate and decode the binary marker ID from each candidate.
- Performs geometric checks (like corner ordering and orientation) to ensure the marker is valid.
- Once validated, it returns an array of detected markers, each with an ID and corner positions.

This is the core detection engine in the system, meant to be used before pose estimation.

### `atf.js`
#### `AR.Tracker`

This class performs marker tracking and pose estimation.

- Takes detected markers (from `aruco.js`) and estimates their 3D pose using camera calibration data and marker size.
- Uses the POSIT algorithm (from `posit1.js` or `posit2.js`) to compute rotation and translation vectors.
- Stores and returns results including marker ID, transformation matrix, and marker corners.
- Handles conversion from 2D image space to 3D world space.

It’s essentially the bridge between detection and augmented reality rendering, enabling virtual objects to be placed accurately on top of physical markers.

### `bilateral.js`
#### `AR.BilateralFilter`

This class applies a bilateral filter to an image.

- The bilateral filter smooths the image while preserving edges, which helps in reducing noise without blurring important features like marker edges.
- It combines both spatial proximity and pixel intensity differences to compute the filter's weight.
- Parameters include spatial and range sigma values controlling how much influence neighboring pixels have.
- Used during image preprocessing before marker detection for better accuracy.

This filter improves marker detection robustness, especially under noisy or blurry conditions.

### `cv.js`
#### `cv` Namespace

This file defines a lightweight computer vision (CV) utility library under the `cv` namespace. It includes basic operations needed for marker detection and tracking.

#### Parts:
- **Image Preprocessing**: Functions for grayscale conversion, thresholding, adaptive thresholding, and connected components labeling.
- **Geometric Operations**: Includes contour approximation, polygon testing, convex hull calculations, and corner detection.
- **Math & Matrix Utilities**: Provides matrix operations, eigenvalue solvers, and PCA used in marker pose estimation.
- **Edge & Corner Detection**: Implements core logic for finding contours and identifying candidate quadrilaterals.

### `debug-posit.html`

This is a basic HTML file used for debugging and testing the POSIT algorithm (Pose from Orthography and Scaling with ITerations).
#### Parts:
- **Canvas Setup**:  
Includes a `<canvas>` element where the visual output (e.g., projected 3D model or pose estimation) can be rendered.

- **Script Imports**:  
Loads necessary JavaScript files such as:

- `posit1.js` or `posit2.js` – contains the POSIT algorithm implementation.
- `svd.js` – provides the Singular Value Decomposition used by POSIT.
- `debug-posit.js` – likely handles canvas rendering and user interaction for visualization.

- **Basic Structure**:  
The HTML is minimal and mainly serves to host the canvas and include the relevant scripts.

### `edge.js`

This module is responsible for **edge detection** in images, typically used as a preprocessing step for marker detection in AR systems.
#### Main Responsibilities:

- **Image Thresholding**: Converts an image to black and white using a threshold value. This helps simplify the image by focusing only on high-contrast edges.
- **Edge Detection Algorithm**: Applies a **Sobel filter** or a similar convolution-based method to detect edges by computing image gradients.
- **Contour Extraction**: Once edges are detected, the module may trace these edges to extract **contours** or **polygons**, which can later be matched against known marker patterns.
- **Noise Reduction & Cleanup**: Some functions may perform morphological operations (like dilation/erosion) to reduce noise and strengthen meaningful edges.
#### Usage Context:

This file is used by higher-level modules (e.g., `aruco.js` or `multitagsystem.js`) to isolate shapes and regions in a video frame that could represent markers.

### `ekf.js`

This module implements an **Extended Kalman Filter (EKF)** used for **predicting and smoothing the pose (position and orientation)** of detected markers over time.

#### Main Responsibilities:
- **State Estimation**: Maintains an internal state vector (e.g., position, velocity, rotation) that represents the pose of a marker.
- **Prediction Step**: Based on a motion model (e.g., assuming constant velocity), predicts the next state before receiving new observations.
- **Update Step**: When a new marker pose is observed, updates the state estimate by blending the prediction with the measurement, using Kalman gain.
- **Covariance Tracking**: Maintains and updates the covariance matrix to account for uncertainty in both the motion model and observations.

#### Usage Context:
Used by `multitagsystem.js` or similar systems to provide **temporal stability** to marker tracking. EKF helps reduce jitter and noise in pose estimation by smoothing the outputs over time.

### `kalman.js`

This file implements a **standard (linear) Kalman Filter**, used for **smoothing scalar time-series data**, like 1D values (e.g., x or y position, angle, etc.).

#### Key Features:
- **Prediction**: Estimates the next value based on the previous state and system dynamics.
- **Update**: Corrects the prediction using the new observed measurement.
- **Noise Handling**: Takes into account both process noise (system uncertainty) and measurement noise (sensor uncertainty) via tunable parameters.

#### Differences from `ekf.js`:
- `kalman.js` is **simpler** and works for **linear systems** with **1D or small vector state**.
- `ekf.js` is for **non-linear models** and handles more complex states like full 3D pose.

#### Typical Use:
Used in scenarios where simple smoothing is needed, such as filtering noisy 1D position data (e.g., marker center X/Y).

### `multiS.js`

This file manages **multiple marker tracking** using pose estimation logic, essentially acting as a wrapper to handle **multiple marker IDs** and their individual tracking states.

#### Key Functions of the Script:
- **Marker Management**: Tracks multiple markers simultaneously using a dictionary keyed by marker IDs.
- **Pose Estimation**: For each marker, it stores and updates pose information, likely from the POSIT algorithm.
- **Visibility Tracking**: Keeps track of whether each marker is currently visible or not.
- **Integration Point**: Interfaces between marker detection (e.g., from `aruco.js`) and pose estimation logic (e.g., `posit1.js` or `posit2.js`).

#### Use Case:
This is part of the system that keeps pose data updated for multiple markers and provides a centralized structure to query the latest states. It’s especially useful in AR applications that rely on **multi-marker setups**.

### `optic.js`

This file implements an **Optical Flow Tracker** class used for tracking marker positions between frames when standard detection fails—typically due to **motion blur** or **temporary occlusion**.

#### Key Features:
- **Lucas-Kanade Optical Flow**: Uses a simplified Lucas-Kanade method to estimate motion of corner points from one frame to the next.
- **Tracking Continuity**: Allows marker tracking to persist across frames even if the marker isn't re-detected, improving stability.
- **Grayscale Conversion**: Converts frames to grayscale for more efficient tracking.
- **Motion Estimation**: Maintains a smoothed motion vector across frames and computes tracking quality.
- **Debug Visualization**: Supports visual debugging with tracked points, motion vectors, and search windows.

#### Purpose:
It supplements marker-based tracking by maintaining marker position when the detection algorithm momentarily loses track of the marker—ensuring **robust and stable AR overlays**.

### `posit1.js`

This file implements the **POS algorithm (Pose from Orthography and Scaling with ITerations)**, specifically designed for estimating the **3D pose** of a flat, coplanar object (like an AR marker) given its image coordinates and known 3D model.

#### Key Features:

- **Model Initialization**: Constructs a 3D model (usually a square) centered at the origin in object space.
- **Pose Estimation**:
- Computes two initial pose candidates using geometric reasoning and the object's normal.
- Selects the most plausible pose by minimizing projection error.
- **Iterative Refinement**: Refines pose estimates via an iterative approach to reduce image reprojection error.
- **Validation**: Ensures the pose is geometrically valid (e.g., object is in front of the camera).
- **Uses SVD**: Relies on Singular Value Decomposition (from `svd.js`) for pseudo-inverse calculations during model preparation.

#### Purpose:
Enables **accurate camera pose estimation** for 3D overlay in augmented reality scenarios, especially when using square planar markers (like ArUco or custom designs).

### `posit2.js`

This file is a **modernized and more modular implementation of the POSIT algorithm** for 3D pose estimation using a set of known 3D model points and their 2D projections in the image.

#### Key Features:
- **Modular Design**: Uses dedicated vector (`Vec3`) and matrix (`Mat3`) classes for all 3D math operations, improving code readability and reuse.
- **Model Initialization**:
- Builds a square 3D model.
- Computes a pseudo-inverse of the model matrix using SVD for pose calculation.
- Calculates the model's surface normal.
- **Pose Calculation**:
- Computes two possible camera poses (rotation + translation) that explain the 2D projections.
- Uses trigonometric reasoning and vector projections to derive these possibilities.
- **Iterative Refinement**:
- Improves the pose estimate by minimizing angular differences between actual and projected points.
- Stops when the error stabilizes or a maximum number of iterations is reached.
- **Error Metric**: Uses angle-based error between the original and reprojected image points to evaluate pose accuracy.

#### Purpose:
Provides a robust method for computing camera pose from a known planar object, suitable for marker-based AR. It is a refined and structured version of `posit1.js`.

### `svd.js`

This file implements **Singular Value Decomposition (SVD)** using the **Golub–Reinsch algorithm** based on the method described in _Numerical Recipes in C_. It decomposes a matrix `A` into three components where:
- `U` (stored in `a`) – left singular vectors (transformed during reduction)
- `W` – array of singular values (diagonal matrix)
- `V` – right singular vectors

#### Key Features:
- **Householder Reduction**: Transforms the original matrix to bidiagonal form.
- **QR Iteration**: Diagonalizes the bidiagonal matrix to extract singular values.
- **Orthogonal Transformations**: Accumulates transformations into matrices `U` and `V`.
- **Error Handling**: Uses a convergence loop with a maximum of 30 iterations.
- **Support Functions**:
- `SVD.pythag(a, b)`: Computes a2+b2\sqrt{a^2 + b^2}a2+b2​ safely to avoid overflow.
- `SVD.sign(a, b)`: Returns `a` with the sign of `b`.

#### Purpose:
Used in `posit1.js` and `posit2.js` to compute the **pseudo-inverse** of the 3x3 model matrix, which is crucial for solving the least-squares estimation of camera pose.

## Contributors
- **Emre Dayangaç** - Developer
- **Mehmet Bener** - Developer
- **HisarCS Team** - Maintainers

## Copyright
© 2025 HisarCS Team. All rights reserved. Unauthorized duplication or distribution of this software is prohibited.