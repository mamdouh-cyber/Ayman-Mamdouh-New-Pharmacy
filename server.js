const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

const PORT = 3000;

// File paths for data persistence
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const MEDICINES_FILE = path.join(__dirname, 'data', 'medicines.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Load data from files
function loadData() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
    
    // Load users
    if (fs.existsSync(USERS_FILE)) {
        try {
            const usersData = fs.readFileSync(USERS_FILE, 'utf8');
            users = JSON.parse(usersData);
        } catch (err) {
            console.error('Error loading users:', err);
            users = [];
        }
    } else {
        users = [];
    }
    
    // Load medicines
    if (fs.existsSync(MEDICINES_FILE)) {
        try {
            const medicinesData = fs.readFileSync(MEDICINES_FILE, 'utf8');
            medicines = JSON.parse(medicinesData);
        } catch (err) {
            console.error('Error loading medicines:', err);
            medicines = [];
        }
    } else {
        medicines = [];
    }
    
    // Load orders
    if (fs.existsSync(ORDERS_FILE)) {
        try {
            const ordersData = fs.readFileSync(ORDERS_FILE, 'utf8');
            orders = JSON.parse(ordersData);
        } catch (err) {
            console.error('Error loading orders:', err);
            orders = [];
        }
    } else {
        orders = [];
    }
    
    // Initialize admin user if not exists
    const adminUser = {
        username: 'Ayman_Mamdouh',
        password: 'ASMA#',
        address: 'Admin Address',
        role: 'admin'
    };
    
    const adminExists = users.some(user => user.username === adminUser.username);
    if (!adminExists) {
        users.push(adminUser);
        saveUsers();
    }
}

// Save data to files
function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function saveMedicines() {
    fs.writeFileSync(MEDICINES_FILE, JSON.stringify(medicines, null, 2));
}

function saveOrders() {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// In-memory storage for users, medicines, and orders
let users = [];
let medicines = [];
let orders = [];

// Load data at startup
loadData();

function serveStaticFile(req, res, pathname) {
    // Handle root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Map the pathname to a file in the parent directory (main project folder)
    const projectRoot = path.resolve(__dirname, '..');
    
    // Resolve the file path to prevent directory traversal attacks and ensure proper path resolution
    const resolvedPath = path.resolve(projectRoot);
    const requestedPath = path.resolve(projectRoot, pathname.substring(1));
    
    // Make sure the requested path is within the project root
    if (!requestedPath.startsWith(resolvedPath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const filePath = requestedPath;
    
    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // Define content types for different file extensions
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Log the missing file for debugging
                console.log(`File not found: ${filePath}`);
                // For missing static assets like CSS, JS, images, try to serve them from the correct location
                // First, try to check if it's a common static asset and try alternative paths
                const fileName = path.basename(filePath);
                
                // Look for the file in common locations
                const commonPaths = [
                    path.join(projectRoot, fileName),
                    path.join(projectRoot, 'css', fileName),
                    path.join(projectRoot, 'js', fileName),
                    path.join(projectRoot, 'styles', fileName),
                    path.join(projectRoot, 'scripts', fileName),
                    path.join(projectRoot, 'Images', fileName),
                    path.join(projectRoot, 'images', fileName),
                    path.join(projectRoot, 'img', fileName)
                ];
                
                let fileFound = false;
                let processed = false;
                
                // Loop through common paths to find the file
                for (const altPath of commonPaths) {
                    if (fs.existsSync(altPath)) {
                        // Read and serve the file
                        fs.readFile(altPath, (altError, altContent) => {
                            if (!altError && !processed) {
                                res.writeHead(200, { 'Content-Type': contentType });
                                res.end(altContent, 'utf-8');
                                processed = true;
                            } else if (processed) {
                                // Response already sent, do nothing
                            } else {
                                // If we couldn't read the alternative file, serve index.html
                                if (!processed) {
                                    const indexPath = path.join(projectRoot, 'index.html');
                                    fs.readFile(indexPath, (indexError, indexContent) => {
                                        if (indexError) {
                                            res.writeHead(404, { 'Content-Type': 'text/html' });
                                            res.end(`<!DOCTYPE html><html><head><title>Page Not Found</title></head><body><h1>Page Not Found</h1><p>File: ${pathname}</p><p><a href="/">Home</a></p></body></html>`);
                                        } else {
                                            res.writeHead(200, { 'Content-Type': 'text/html' });
                                            res.end(indexContent, 'utf-8');
                                        }
                                    });
                                    processed = true;
                                }
                            }
                        });
                        fileFound = true;
                        break; // Stop after finding the first match
                    }
                }
                
                // If no file was found in alternative locations, serve index.html
                if (!fileFound && !processed) {
                    const indexPath = path.join(projectRoot, 'index.html');
                    fs.readFile(indexPath, (indexError, indexContent) => {
                        if (indexError) {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            res.end(`<!DOCTYPE html><html><head><title>Page Not Found</title></head><body><h1>Page Not Found</h1><p>File: ${pathname}</p><p><a href="/">Home</a></p></body></html>`);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(indexContent, 'utf-8');
                        }
                    });
                }
            } else {
                // Some other error
                console.error(`Server error: ${error.code} for ${filePath}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>Server Error</h1><p>Error: ${error.code}</p><p><a href="/">Return Home</a></p></body></html>`);
            }
        } else {
            // Success - serve the file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
};

// Handle HTTP requests
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle API routes
    if (pathname === '/register' && req.method === 'POST') {
        handleRegister(req, res);
    } else if (pathname === '/login' && req.method === 'POST') {
        handleLogin(req, res);
    } else if (pathname === '/medicines' && req.method === 'GET') {
        handleGetMedicines(req, res);
    } else if (pathname === '/medicines' && req.method === 'POST') {
        handleAddMedicine(req, res);
    } else if (pathname === '/orders' && req.method === 'POST') {
        handlePlaceOrder(req, res);
    } else if (pathname === '/orders' && req.method === 'GET') {
        handleGetOrders(req, res);
    } else if (pathname.match(/^\/orders\/\d+\/delivery-time$/) && req.method === 'PUT') {
        // Extract order ID from URL
        const orderId = parseInt(pathname.split('/')[2]);
        handleUpdateDeliveryTime(req, res, orderId);
    } else if (pathname.match(/^\/orders\/\d+\/confirm-delivery$/) && req.method === 'PUT') {
        // Extract order ID from URL
        const orderId = parseInt(pathname.split('/')[2]);
        handleConfirmDelivery(req, res, orderId);
    } else if (pathname === '/clear-notifications' && req.method === 'POST') {
        handleClearNotifications(req, res);
    } else if (pathname.match(/^\/medicines\/\d+$/) && req.method === 'PUT') {
        // Extract medicine ID from URL
        const medicineId = parseInt(pathname.split('/')[2]);
        handleUpdateMedicine(req, res, medicineId);
    } else if (pathname.match(/^\/medicines\/\d+$/) && req.method === 'DELETE') {
        // Extract medicine ID from URL
        const medicineId = parseInt(pathname.split('/')[2]);
        handleDeleteMedicine(req, res, medicineId);
    } else if (pathname === '/clear-orders' && req.method === 'POST') {
        handleClearAllOrders(req, res);
    } else if (pathname === '/clear-users' && req.method === 'POST') {
        handleClearAllUsers(req, res);
    } else {
        // Serve static files
        serveStaticFile(req, res, pathname);
    }
});

// Handle user registration
function handleRegister(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username, password, address, location } = parsedBody;
                    
            // Check if user already exists
            const existingUser = users.find(user => user.username === username);
            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'اسم المستخدم موجود بالفعل' }));
                return;
            }
                    
            // Validate location if provided
            if (location) {
                // Since we are sending lat/lng from frontend, we can't validate country here
                // The frontend already validated that the user is in Egypt
                // We'll trust the frontend validation
            }
                    
            // Get location link from request if provided
            const locationLink = parsedBody.locationLink || null;
            
            // Create new user
            const newUser = {
                username,
                password,
                address,
                location, // Store location data
                locationLink, // Store location link
                mapImage: location ? `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=15&size=400x200&maptype=roadmap&markers=color:red%7Clabel:C%7C${location.latitude},${location.longitude}` : null, // Store map image URL
                role: 'user' // Default role is user
            };
            
            users.push(newUser);
            saveUsers(); // Save users to file
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true,
                message: 'تم انشاء الحساب بنجاح' 
            }));
        } catch (error) {
            console.error('Registration error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                message: 'Invalid request data or server error' 
            }));
        }
    });
}

// Handle user login
function handleLogin(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { username, password } = JSON.parse(body);
            
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    user: { 
                        username: user.username, 
                        role: user.role,
                        address: user.address,
                        location: user.location // Include location in user data
                    } 
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'اسم المستخدم او كلمة المرور غير صحيحة' 
                }));
            }
        } catch (error) {
            console.error('Login error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                message: 'Invalid request data or server error' 
            }));
        }
    });
}

// Handle getting medicines
function handleGetMedicines(req, res) {
    // Return all medicines with their addedBy information
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(medicines));
}

// Handle adding medicine (admin only)
function handleAddMedicine(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { name, price, quantity, image } = JSON.parse(body);
            
            // If image is a data URL (base64), save it to file
            let imagePath = image;
            if (image && typeof image === 'string' && image.startsWith('data:image')) {
                try {
                    // Extract image type and data
                    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                        const imageType = matches[1];
                        const imageData = matches[2];
                                    
                        // Create filename
                        const filename = `medicine_${Date.now()}.${imageType}`;
                        const filepath = path.join(__dirname, 'Images', filename);
                                    
                        // Ensure Images directory exists
                        if (!fs.existsSync(path.join(__dirname, 'Images'))) {
                            fs.mkdirSync(path.join(__dirname, 'Images'), { recursive: true });
                        }
                                    
                        // Write image data to file
                        fs.writeFileSync(filepath, imageData, 'base64');
                        imagePath = `../Images/${filename}`;
                    }
                } catch (imageError) {
                    console.error('Error saving image:', imageError);
                    // Use default image if there's an error saving the uploaded image
                    imagePath = '../Images/placeholder.jpg';
                }
            }
            
            // For now, we'll assume all requests to add medicines come from admin
            // In a production app, you'd validate authentication here
            const addedBy = 'admin'; // Default admin for now
            const newMedicine = {
                id: medicines.length + 1,
                name,
                price,
                quantity: quantity || 1, // Default to 1 if no quantity provided
                image: imagePath || '../Images/placeholder.jpg', // Default image if none provided
                addedBy: addedBy
            };
            
            medicines.push(newMedicine);
            saveMedicines(); // Save medicines to file
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true,
                message: 'تم اضافة الدواء بنجاح', 
                medicine: newMedicine 
            }));
        } catch (error) {
            console.error('Error adding medicine:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                message: 'Invalid request data or server error' 
            }));
        }
    });
}

// Handle updating a medicine (for quantity changes)
function handleUpdateMedicine(req, res, medicineId) {
    let body = '';

    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
        try {
            const updatedMedicine = JSON.parse(body);

            // Find the medicine by ID
            const medicineIndex = medicines.findIndex(function(m) { return m.id === medicineId; });

            if (medicineIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'الدواء غير موجود' }));
                return;
            }

            // Update the medicine with new data
            medicines[medicineIndex] = {
                ...medicines[medicineIndex],
                ...updatedMedicine
            };

            saveMedicines(); // Save medicines to file

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true,
                message: 'تم تحديث الدواء بنجاح',
                medicine: medicines[medicineIndex]
            }));
        } catch (error) {
            console.error('Error updating medicine:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                message: 'Invalid request data or server error' 
            }));
        }
    });
}

// Handle placing order
function handlePlaceOrder(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { medicines: orderMedicines, address, user, phoneNumber, locationLink } = JSON.parse(body);
            
            // Find the user to get their original registration location
            const userRecord = users.find(u => u.username === user);
            
            // Check and update medicine quantities based on order
            let hasSufficientQuantity = true;
            for (const orderMedicine of orderMedicines) {
                const medicine = medicines.find(m => m.id === orderMedicine.id);
                if (medicine) {
                    if (medicine.quantity < orderMedicine.quantity) {
                        hasSufficientQuantity = false;
                        break;
                    }
                    medicine.quantity -= orderMedicine.quantity;
                } else {
                    hasSufficientQuantity = false;
                    break;
                }
            }
            
            if (!hasSufficientQuantity) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'الكمية المتوفرة من أحد الأدوية غير كافية' }));
                return;
            }
            
            const newOrder = {
                id: orders.length + 1,
                medicines: orderMedicines,
                address,
                user,
                phoneNumber, // Store phone number
                location: userRecord ? userRecord.location : null, // Use user's original registration location
                locationLink: locationLink || (userRecord ? userRecord.locationLink : null), // Use order location link first, fallback to user's registration link
                mapImage: userRecord ? userRecord.mapImage : null, // Include user's map image
                timestamp: new Date().toISOString(),
                status: 'pending',
                deliveryTime: null, // Will be set by admin
                notifications: [{
                    type: 'new_order',
                    message: `طلب جديد من ${user} - ${orderMedicines.length} أدوية`,
                    timestamp: new Date().toISOString(),
                    read: false
                }] // Add initial notification
            };
            
            orders.push(newOrder);
            saveOrders(); // Save orders to file
            saveMedicines(); // Save updated medicine quantities to file
            
            // In a real application, you would send notification to admin
            console.log('New order received:', newOrder);
            
            // Add notification for admin
            console.log(`تنبيه: تم استلام طلب جديد من ${user} - ${orderMedicines.length} أدوية`);
            
            // Desktop notification for admin
            console.log(`Desktop Notification: طلب جديد من ${user} - ${orderMedicines.length} أدوية`);
            
            // In a real app, you would send this via WebSocket or similar to the admin dashboard
            // For now, we're logging it which would be monitored by the admin interface
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'تم ارسال الطلب بنجاح', orderId: newOrder.id }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid request data' }));
        }
    });
}

// Handle getting orders (for admin)
function handleGetOrders(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(orders));
}

// Handle updating delivery time for an order
function handleUpdateDeliveryTime(req, res, orderId) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { deliveryTime, status, deliveryPrice } = JSON.parse(body);
            
            // Find the order by ID
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'الطلب غير موجود' }));
                return;
            }
            
            // Update the order
            if (deliveryTime) {
                order.deliveryTime = deliveryTime;
            }
            
            if (status) {
                order.status = status;
            }
            
            if (deliveryPrice !== undefined) {
                order.deliveryPrice = deliveryPrice;
                // Set order confirmation status to pending when delivery price is set
                if (order.status === 'processing' && order.deliveryPrice !== undefined && order.deliveryConfirmed === undefined) {
                    order.deliveryConfirmed = null; // null means pending confirmation
                }
            }
            
            saveOrders(); // Save orders to file
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'تم تحديث وقت التسليم بنجاح', order }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid request data' }));
        }
    });
}

// Handle confirming or rejecting delivery price for an order
function handleConfirmDelivery(req, res, orderId) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { confirmed } = JSON.parse(body);
            
            // Find the order by ID
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'الطلب غير موجود' }));
                return;
            }
            
            // Update the order confirmation status
            order.deliveryConfirmed = confirmed; // true for yes, false for no
            
            if (confirmed === false) {
                // If user rejects, we can set status back to pending or keep as processing
                // For this implementation, we'll keep it as processing but mark delivery as rejected
                order.status = 'pending'; // Set back to pending if delivery is rejected
                
                // Create a notification for the admin about the rejection
                console.log(`العميل لم يوافق علي السعر التوصيل لانه غالي - الطلب #${order.id}`);
            } else {
                // If user confirms, notify admin
                console.log(`العميل وافق على سعر التوصيل - الطلب #${order.id}`);
            }
            
            saveOrders(); // Save orders to file
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: confirmed ? 'تم تأكيد الطلب' : 'تم رفض الطلب', order }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid request data' }));
        }
    });
}

// Handle clearing notifications for a user
function handleClearNotifications(req, res) {
    let body = '';
    
    req.on('data', function(chunk) {
        body += chunk.toString();
    });
    
    req.on('end', function() {
        try {
            const { username } = JSON.parse(body);
            
            // In a real implementation, you would clear only the notifications for this user
            // For now, we'll just return success since notifications are based on orders
            // and the frontend will handle clearing the display
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'تم مسح الإشعارات بنجاح' }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid request data' }));
        }
    });
}

// Handle updating a medicine (for quantity changes)
function handleUpdateMedicine(req, res, medicineId) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const updatedMedicine = JSON.parse(body);
            
            // Find the medicine by ID
            const medicineIndex = medicines.findIndex(m => m.id === medicineId);
            
            if (medicineIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'الدواء غير موجود' }));
                return;
            }
            
            // Update the medicine with new data
            medicines[medicineIndex] = {
                ...medicines[medicineIndex],
                ...updatedMedicine
            };
            
            saveMedicines(); // Save medicines to file
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true,
                message: 'تم تحديث الدواء بنجاح',
                medicine: medicines[medicineIndex]
            }));
        } catch (error) {
            console.error('Error updating medicine:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                message: 'Invalid request data or server error' 
            }));
        }
    });
}

// Handle deleting a medicine (admin only)
function handleDeleteMedicine(req, res, medicineId) {
    try {
        // Convert medicineId to integer if it's not already
        const id = parseInt(medicineId);
        
        // Find the medicine by ID
        const medicineIndex = medicines.findIndex(function(m) { return m.id === id; });
        
        if (medicineIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'الدواء غير موجود' }));
            return;
        }
        
        // Remove the medicine from the array
        medicines.splice(medicineIndex, 1);
        saveMedicines(); // Save medicines to file
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'تم حذف الدواء بنجاح' }));
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'حدث خطأ أثناء حذف الدواء' }));
    }
}

// Handle clearing all orders
function handleClearAllOrders(req, res) {
    // Clear all orders array
    orders = [];
    
    // Save empty orders to file
    saveOrders();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'تم مسح جميع الطلبات بنجاح' }));
}

// Handle clearing all users
function handleClearAllUsers(req, res) {
    // Clear all users except admin (if admin exists)
    const adminUser = users.find(user => user.role === 'admin');
    users = adminUser ? [adminUser] : [];
    
    // Save empty users to file (except admin)
    saveUsers();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'تم مسح جميع الحسابات بنجاح' }));
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});