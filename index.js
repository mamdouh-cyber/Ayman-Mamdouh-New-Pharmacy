const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const querystring = require("querystring");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory with proper path resolution
app.use(express.static(path.join(__dirname), {
    fallthrough: true // Allow fallthrough to our routes if file not found
}));

const PORT = process.env.PORT || 3000;

// File paths for data persistence
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const MEDICINES_FILE = path.join(__dirname, 'data', 'medicines.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// In-memory storage for users, medicines, and orders
let users = [];
let medicines = [];
let orders = [];

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

// Load data at startup
loadData();

// Handle user registration
function handleRegister(req, res) {
    try {
        const { username, password, address, location } = req.body;
                
        // Check if user already exists
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
            return;
        }
                
        // Validate location if provided
        if (location) {
            // Since we are sending lat/lng from frontend, we can't validate country here
            // The frontend already validated that the user is in Egypt
            // We'll trust the frontend validation
        }
                
        // Get location link from request if provided
        const locationLink = req.body.locationLink || null;
        
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
        
        res.status(201).json({ 
            success: true,
            message: 'تم انشاء الحساب بنجاح' 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            success: false,
            message: 'Invalid request data or server error' 
        });
    }
}

// Handle user login
function handleLogin(req, res) {
    try {
        const { username, password } = req.body;
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            res.status(200).json({ 
                success: true, 
                user: { 
                    username: user.username, 
                    role: user.role,
                    address: user.address,
                    location: user.location // Include location in user data
                } 
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'اسم المستخدم او كلمة المرور غير صحيحة' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ 
            success: false,
            message: 'Invalid request data or server error' 
        });
    }
}

// Handle getting medicines
function handleGetMedicines(req, res) {
    // Return all medicines with their addedBy information
    res.json(medicines);
}

// Handle adding medicine (admin only)
function handleAddMedicine(req, res) {
    try {
        const { name, price, quantity, image } = req.body;
        
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
                    imagePath = `/Images/${filename}`;
                }
            } catch (imageError) {
                console.error('Error saving image:', imageError);
                // Use default image if there's an error saving the uploaded image
                imagePath = '/Images/placeholder.jpg';
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
            image: imagePath || '/Images/placeholder.jpg', // Default image if none provided
            addedBy: addedBy
        };
        
        medicines.push(newMedicine);
        saveMedicines(); // Save medicines to file
        
        res.status(201).json({ 
            success: true,
            message: 'تم اضافة الدواء بنجاح', 
            medicine: newMedicine 
        });
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(400).json({ 
            success: false,
            message: 'Invalid request data or server error' 
        });
    }
}

// Handle updating a medicine (for quantity changes)
function handleUpdateMedicine(req, res, medicineId) {
    try {
        const updatedMedicine = req.body;

        // Find the medicine by ID
        const medicineIndex = medicines.findIndex(function(m) { return m.id === medicineId; });

        if (medicineIndex === -1) {
            res.status(404).json({ message: 'الدواء غير موجود' });
            return;
        }

        // Update the medicine with new data
        medicines[medicineIndex] = {
            ...medicines[medicineIndex],
            ...updatedMedicine
        };

        saveMedicines(); // Save medicines to file

        res.status(200).json({ 
            success: true,
            message: 'تم تحديث الدواء بنجاح',
            medicine: medicines[medicineIndex]
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(400).json({ 
            success: false,
            message: 'Invalid request data or server error' 
        });
    }
}

// Handle placing order
function handlePlaceOrder(req, res) {
    try {
        const { medicines: orderMedicines, address, user, phoneNumber, locationLink } = req.body;
        
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
            res.status(400).json({ message: 'الكمية المتوفرة من أحد الأدوية غير كافية' });
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
        
        res.status(201).json({ message: 'تم ارسال الطلب بنجاح', orderId: newOrder.id });
    } catch (error) {
        res.status(400).json({ message: 'Invalid request data' });
    }
}

// Handle getting orders (for admin)
function handleGetOrders(req, res) {
    res.json(orders);
}

// Handle updating delivery time for an order
function handleUpdateDeliveryTime(req, res, orderId) {
    try {
        const { deliveryTime, status, deliveryPrice } = req.body;
        
        // Find the order by ID
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            res.status(404).json({ message: 'الطلب غير موجود' });
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
        
        res.status(200).json({ message: 'تم تحديث وقت التسليم بنجاح', order });
    } catch (error) {
        res.status(400).json({ message: 'Invalid request data' });
    }
}

// Handle confirming or rejecting delivery price for an order
function handleConfirmDelivery(req, res, orderId) {
    try {
        const { confirmed } = req.body;
        
        // Find the order by ID
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            res.status(404).json({ message: 'الطلب غير موجود' });
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
        
        res.status(200).json({ message: confirmed ? 'تم تأكيد الطلب' : 'تم رفض الطلب', order });
    } catch (error) {
        res.status(400).json({ message: 'Invalid request data' });
    }
}

// Handle clearing notifications for a user
function handleClearNotifications(req, res) {
    try {
        const { username } = req.body;
        
        // In a real implementation, you would clear only the notifications for this user
        // For now, we'll just return success since notifications are based on orders
        // and the frontend will handle clearing the display
        
        res.status(200).json({ message: 'تم مسح الإشعارات بنجاح' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid request data' });
    }
}

// Handle deleting a medicine (admin only)
function handleDeleteMedicine(req, res, medicineId) {
    try {
        // Convert medicineId to integer if it's not already
        const id = parseInt(medicineId);
        
        // Find the medicine by ID
        const medicineIndex = medicines.findIndex(function(m) { return m.id === id; });
        
        if (medicineIndex === -1) {
            res.status(404).json({ message: 'الدواء غير موجود' });
            return;
        }
        
        // Remove the medicine from the array
        medicines.splice(medicineIndex, 1);
        saveMedicines(); // Save medicines to file
        
        res.status(200).json({ message: 'تم حذف الدواء بنجاح' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء حذف الدواء' });
    }
}

// Handle clearing all orders
function handleClearAllOrders(req, res) {
    // Clear all orders array
    orders = [];
    
    // Save empty orders to file
    saveOrders();
    
    res.status(200).json({ message: 'تم مسح جميع الطلبات بنجاح' });
}

// Handle clearing all users
function handleClearAllUsers(req, res) {
    // Clear all users except admin (if admin exists)
    const adminUser = users.find(user => user.role === 'admin');
    users = adminUser ? [adminUser] : [];
    
    // Save empty users to file (except admin)
    saveUsers();
    
    res.status(200).json({ message: 'تم مسح جميع الحسابات بنجاح' });
}

// Handle API routes
app.post('/register', handleRegister);
app.post('/login', handleLogin);
app.get('/medicines', handleGetMedicines);
app.post('/medicines', handleAddMedicine);
app.post('/orders', handlePlaceOrder);
app.get('/orders', handleGetOrders);

// Dynamic routes with parameters
app.put('/orders/:orderId/delivery-time', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    handleUpdateDeliveryTime(req, res, orderId);
});

app.put('/orders/:orderId/confirm-delivery', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    handleConfirmDelivery(req, res, orderId);
});

app.post('/clear-notifications', handleClearNotifications);

app.put('/medicines/:medicineId', (req, res) => {
    const medicineId = parseInt(req.params.medicineId);
    handleUpdateMedicine(req, res, medicineId);
});

app.delete('/medicines/:medicineId', (req, res) => {
    const medicineId = parseInt(req.params.medicineId);
    handleDeleteMedicine(req, res, medicineId);
});

app.post('/clear-orders', handleClearAllOrders);
app.post('/clear-users', handleClearAllUsers);

// API endpoint to check if server is running
app.get("/api", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// Specific routes for HTML pages to ensure they're served properly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Case-insensitive routes for common pages
app.get(/\/(pages\/)?medicine\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'medicine.html'));
});

app.get(/\/(pages\/)?login\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get(/\/(pages\/)?resigter\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'resigter.html'));
});

app.get(/\/(pages\/)?admin\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get(/\/(pages\/)?about\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get(/\/(pages\/)?services\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

app.get(/\/(pages\/)?notification\.html/i, (req, res) => {
    res.sendFile(path.join(__dirname, 'notification.html'));
});

// Additional catch-all for pages subdirectory
app.get('/pages/*', (req, res) => {
    // Extract the actual file name from the pages subdirectory request
    const requestedFile = req.path.replace(/^\/pages\//i, '');
    const filePath = path.join(__dirname, requestedFile);
    
    // Check if the file exists in the root directory
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
            res.sendFile(filePath);
        } else {
            // If not found in root, send index.html for SPA routing
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Catch-all route to serve index.html for client-side routing
// This should be last, after all specific routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});