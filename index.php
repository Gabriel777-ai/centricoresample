<?php
// PHP Backend Logic
$logFile = 'trade_registry.json';
$productsFile = 'products.json';

// Load dynamic products catalog
$products = [];
if (file_exists($productsFile)) {
  $productsContent = file_get_contents($productsFile);
  $products = json_decode($productsContent, true) ?: [];
}

// 1. Handle AJAX Form Submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'submit_spec') {
  header('Content-Type: application/json');

  // Read raw JSON post data
  $inputData = json_decode(file_get_contents('php://input'), true);

  $name = htmlspecialchars(strip_tags(trim($inputData['name'] ?? '')));
  $company = htmlspecialchars(strip_tags(trim($inputData['company'] ?? '')));
  $category = htmlspecialchars(strip_tags(trim($inputData['category'] ?? '')));
  $message = htmlspecialchars(strip_tags(trim($inputData['message'] ?? '')));

  if (empty($name) || empty($company) || empty($category) || empty($message)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Protocol failure: All fields are required.']);
    exit;
  }

  // Generate simulated trade transaction hash
  $txHash = '0x' . strtoupper(bin2hex(random_bytes(16)));
  $timestamp = date('Y-m-d H:i:s');

  $newEntry = [
    'timestamp' => $timestamp,
    'tx_hash' => $txHash,
    'representative' => $name,
    'company' => $company,
    'category' => $category,
    'message' => $message
  ];

  // Read existing database registry
  $registry = [];
  if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $registry = json_decode($content, true) ?: [];
  }

  // Append and save
  $registry[] = $newEntry;
  file_put_contents($logFile, json_encode($registry, JSON_PRETTY_PRINT));

  echo json_encode([
    'status' => 'success',
    'hash' => $txHash,
    'timestamp' => $timestamp
  ]);
  exit;
}

// 2. Handle AJAX Product Catalog Saving
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'save_products') {
  header('Content-Type: application/json');

  // Read raw JSON post data
  $inputData = json_decode(file_get_contents('php://input'), true);

  if (empty($inputData) || !is_array($inputData)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Protocol failure: Invalid catalog data.']);
    exit;
  }

  // Save changes
  file_put_contents($productsFile, json_encode($inputData, JSON_PRETTY_PRINT));

  echo json_encode([
    'status' => 'success',
    'message' => 'Catalog protocol saved successfully.'
  ]);
  exit;
}

// 3. Fetch Dynamic Metrics for Server-side Rendering
$registeredCount = 412; // Base number representing historical trades
if (file_exists($logFile)) {
  $content = file_get_contents($logFile);
  $registry = json_decode($content, true) ?: [];
  $registeredCount += count($registry);
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CENTRICORE | OFFICIAL MACHINE TRADING</title>
  <meta name="description"
    content="Official CENTRICORE global registry and trading platform for enterprise office machines, high-speed business printers, and professional ID card print fleets.">
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <!-- WebGL Background -->
  <canvas id="webgl-canvas"></canvas>

  <!-- Cyber Aesthetic Grid & Scanning Line Overlay -->
  <div class="cyber-overlay"></div>
  <div class="scanlines"></div>

  <!-- Scrollable UI Content -->
  <div class="ui-container">

    <!-- Header Navigation -->
    <header>
      <div class="logo-container" onclick="document.getElementById('hero').scrollIntoView({behavior: 'smooth'})"
        style="cursor: pointer;">
        <img src="assets/images/centricore_logo_dark_theme.png" alt="CENTRICORE Logo" class="header-logo-img">
      </div>
      <nav>
        <ul class="nav-links">
          <li><a href="#hero">Overview</a></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#about">Company Info</a></li>
        </ul>
      </nav>
    </header>

    <!-- 1. Hero Section -->
    <section id="hero">
      <div class="hero-content">
        <div class="hero-header-box">
          <h1 class="hero-title">
            <span class="highlight">CENTRICORE</span>
          </h1>
          <h2 class="hero-tagline">OFFICIAL MACHINE TRADING</h2>
        </div>
        <p class="hero-description">
          Authorized global registry and distribution platform for CENTRICORE high-performance office machinery. Deploy
          enterprise-grade multifunction printers, high-speed business color engines, and professional direct-to-card
          ID printing systems.
        </p>
      </div>
    </section>

    <!-- 2.5 Products Section -->
    <section id="products">
      <div class="section-header">
        <div class="section-label"><i data-lucide="printer" style="width:16px;"></i> Product Lineup</div>
        <h2 class="section-title">Enterprise Office Machines</h2>
      </div>
      <div class="products-grid">
        <?php foreach ($products as $index => $product): ?>
        <!-- Product <?php echo $index + 1; ?> -->
        <div class="product-card" data-product-id="<?php echo htmlspecialchars($product['id']); ?>">
          <div class="product-image-container">
            <span class="product-badge editable-badge"><?php echo htmlspecialchars($product['badge']); ?></span>
            <img src="<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" class="product-image" draggable="false">
          </div>
          <div class="product-info">
            <h3 class="editable-name"><?php echo htmlspecialchars($product['name']); ?></h3>
            <p class="product-description editable-desc"><?php echo htmlspecialchars($product['description']); ?></p>
            <ul class="product-specs-list">
              <?php foreach ($product['specs'] as $label => $value): ?>
              <li>
                <span class="editable-spec-label"><?php echo htmlspecialchars($label); ?></span>
                <span class="editable-spec-value"><?php echo htmlspecialchars($value); ?></span>
              </li>
              <?php endforeach; ?>
            </ul>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- About & Company Details Section -->
    <section id="about" style="width: 100%; border-bottom: 1px solid var(--border-light); padding: 6rem 10% 4rem; background: linear-gradient(180deg, rgba(15, 27, 53, 0.9) 0%, rgba(30, 20, 60, 0.85) 50%, rgba(15, 27, 53, 0.9) 100%);">
      <div class="specs-content" style="max-width: 1200px; margin: 0 auto; width: 100%;">
        <div class="section-header">
          <div class="section-label"><i data-lucide="info" style="width:16px;"></i> About</div>
          <h2 class="section-title">Company Information</h2>
        </div>
        </p>
        <div class="specs-grid">
          <div class="spec-card">
            <div class="spec-icon-wrapper"><i data-lucide="map-pin"></i></div>
            <h3>Address</h3>
            <p>84- B 2/F Narra St. Bo. Amihan, Project 3 Quezon City, Metro Manila</p>
          </div>
          <div class="spec-card">
            <div class="spec-icon-wrapper"><i data-lucide="mail"></i></div>
            <h3>Email</h3>
            <p>centricore01@gmail.com</p>
          </div>
          <div class="spec-card">
            <div class="spec-icon-wrapper"><i data-lucide="clock"></i></div>
            <h3>Cellphone
              Telephone No.</h3>
            <p>09192262001<br>(02) 8731-7301<br></p>
          </div>
          <div class="spec-card">
            <div class="spec-icon-wrapper"><i data-lucide="file-text"></i></div>
            <h3>Working Days</h3>
            <p>Monday - Friday 8am - 5pm</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-grid">
        <div class="footer-col brand-col">
          <div class="logo-container" onclick="document.getElementById('hero').scrollIntoView({behavior: 'smooth'})"
            style="cursor: pointer; margin-bottom: 1rem;">
            <img src="assets/images/centricore_logo_transparent.png" alt="CENTRICORE Logo" class="footer-logo-img">
          </div>
          <p class="footer-tagline">Premium Office Machinery</p>
          <p class="footer-desc">Your trusted partner for high-performance office equipment, printing solutions, and business technology worldwide.</p>
        </div>

        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul class="footer-links-list">
            <li><a href="#hero">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>Contact</h3>
          <ul class="footer-contact-list">
            <li><i data-lucide="map-pin" class="footer-icon"></i> <span>84- B 2/F Narra St. Bo. Amihan, Project 3 Quezon City, Metro Manila</span></li>
            <li><i data-lucide="phone" class="footer-icon"></i> <span>09192262001/(02) 8731-7301</span></li>
            <li><i data-lucide="mail" class="footer-icon"></i> <span>centricore01@gmail.com</span></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>Information</h3>
          <ul class="footer-credentials-list">
            <li><span>Business Type:</span> <span>Distributor</span></li>
            <li><span>Location:</span> <span>Philippines</span></li>
            <li><span>Timezone:</span> <span>Asia/Manila</span></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; <?php echo date('Y'); ?> CENTRICORE. All rights reserved.</p>
        <p style="color: var(--accent-primary); display: flex; align-items: center; gap: 0.5rem;">
          <span
            style="display:inline-block; width:6px; height:6px; background-color: var(--accent-primary); border-radius:50%; box-shadow:0 0 8px rgba(0, 102, 204, 0.3);"></span>
          Business Hours: 8:00 AM - 5:00 PM
        </p>
      </div>
    </footer>

  </div>

  <!-- GSAP and Lucide via CDNs -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Floating Edit Mode Toggle -->
  <button class="edit-catalog-btn" id="edit-catalog-toggle" aria-label="Toggle Catalog Edit Mode">
    <i data-lucide="lock"></i> <span>Edit Catalog</span>
  </button>

  <!-- Sliding Editor Action Bar -->
  <div class="editor-action-bar" id="editor-action-bar">
    <div class="editor-bar-text">
      <span class="pulse-amber"></span>
      <span>Catalog changes detected. Apply protocol?</span>
    </div>
    <div class="editor-actions-btns">
      <button class="btn-cancel-catalog" id="btn-cancel-catalog">Cancel</button>
      <button class="btn-save-catalog" id="btn-save-catalog">Save Changes</button>
    </div>
  </div>

  <script>
    // Initialize Lucide Icons
    document.addEventListener('DOMContentLoaded', function() {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  </script>

  <script src="app.js"></script>
</body>

</html>