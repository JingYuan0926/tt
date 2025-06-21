import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData = req.body;
    
    // Define the path to the users.json file
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'users.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Read existing users or initialize empty array
    let existingUsers = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingUsers = JSON.parse(fileContent);
    }
    
    // Check for duplicate username, email, or IC number
    const duplicateUser = existingUsers.find(user => 
      user.username === userData.username || 
      user.email === userData.email ||
      user.icNumber === userData.icNumber
    );
    
    if (duplicateUser) {
      const duplicateField = 
        duplicateUser.username === userData.username ? 'username' :
        duplicateUser.email === userData.email ? 'email' : 'IC number';
      
      return res.status(400).json({ 
        message: `User already exists! Duplicate ${duplicateField}`,
        duplicate: duplicateField
      });
    }
    
    // Generate unique identifiers
    const userId = `USER_${Date.now()}`;
    const accountNumber = `ACC${String(existingUsers.length + 1).padStart(6, '0')}`;
    
    // Create new user object
    const newUser = {
      userId: userId,
      accountNumber: accountNumber,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      registrationDate: new Date().toLocaleDateString(),
      status: 'active',
      ...userData
    };
    
    // Add to existing users
    existingUsers.push(newUser);
    
    // Write back to file with pretty formatting
    fs.writeFileSync(filePath, JSON.stringify(existingUsers, null, 2));
    
    console.log(`✅ User saved to file: ${filePath}`);
    console.log(`📊 Total users: ${existingUsers.length}`);
    
    return res.status(200).json({
      message: 'User saved successfully',
      user: newUser,
      totalUsers: existingUsers.length,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ 
      message: 'Error saving user data',
      error: error.message 
    });
  }
} 