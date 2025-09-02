  const express = require("express");
  const path = require('path');
  const mqtt = require("mqtt");
  const app = express();
  const jwt = require("jsonwebtoken");
  const jwt_SECRET = "123456" // ไม่ควรตั้งแบบนี้ ! ในระบบจริง
  const port = 7000;
  const mysql = require("mysql2/promise");
  const cors = require("cors");
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const multer = require('multer');
  const fs = require('fs');
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'src', 'img'));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // ตั้งชื่อไฟล์ไม่ให้ชนกัน
    },
  });
  const upload = multer({ storage: storage });
  const http = require('http');
  const { Server } = require("socket.io");
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { 
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Connint  mariadb
  // const mysql = require("mysql2");

  function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 

    if (!token) return res.status(401).json({ message: "Missing token" });

    jwt.verify(token, jwt_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  }

  const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "ISUS_07_iot",
    database: 'iot'
  });

  const MQTT_SERVER = "mqtt://broker.hivemq.com";
  const temp = "supa/sensor/temp";
  const hue = "supa/sensor/hue";
  // const light = "Suupa_light/sw1";

  app.use('/uploads', express.static(path.join(__dirname, 'src', 'img')));

  const mqtt_id = "ex_" + Math.random().toString(16).substr(2, 8);
  console.log(`กำลังเชื่อมต่อไปยัง MQTT Broker ที่: ${MQTT_SERVER}`);
  const client = mqtt.connect(MQTT_SERVER, { clientId: mqtt_id });
  client.on("connect", () => {
    console.log("เชื่อมต่อกับ MQTT Broker สำเร็จแล้ว!");
    client.subscribe([temp, hue], (err) => { 
      if (!err) {
        console.log(`ตอนนี้กำลังฟังข้อมูลจากหัวข้อ: '${temp}' และ '${hue}'`);
      } else {
        console.error("เกิดข้อผิดพลาดในการสมัครฟังหัวข้อ:", err);
      }
    });
  });
    // Node red
  client.on('message', (topic, message) => {
    const msg = message.toString();
    console.log('topic=', topic)
    if (topic === temp) {
      console.log(`[อุณหภูมิ]: ${msg} °C`);
      io.emit('อุณหภูมิ', msg);
    } else if (topic === hue) {
      console.log(`[ความชื้น]: ${msg} %`);
      io.emit('ความชื้น', msg);
    } 
    // else if (topic === light){
    //   console.log(`[สวิตไฟ]: ${msg}`);
    //   io.emit('สวิตไฟ', msg);
    // }
    else {
      console.log(`ได้รับข้อความจากหัวข้อที่ไม่รู้จัก ('${topic}'): ${msg}`);
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('update_light', (data) => {
      console.log('ได้รับคำสั่งเปิด/ปิดหลอดไฟจาก client:', data);
      client.publish('Suupa_light/sw1', String(data)); // ส่ง MQTT กลับไป
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  client.on('error', (err) => {
    console.error('เกิดข้อผิดพลาดกับ MQTT:', err);
  });
  client.on('disconnect', () => {
    console.log('ตัดการเชื่อมต่อจาก MQTT Broker แล้ว.');
  });

  // เส้นทาง root: http://localhost:7000/


  app.delete("/delete-user/:id", async (req, res) => {
    const userId = req.params.id;   
    try {
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
      console.log("ผลลัพธ์การลบ:", result); 
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการลบ" });
      }
      res.status(200).json({ message: "ลบข้อมูลผู้ใช้สำเร็จ" });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้",
      });
    }
  });
  // แก้ไขส่วนนี้ให้ใช้ multer
  app.post("/edit-user/:id", upload.single("photo"), async (req, res) => {
    const userId = req.params.id;
    const { email, password, status, dep, photoName } = req.body;
    
    let pic = photoName; // เริ่มต้นใช้ชื่อไฟล์เดิม
    
    try {
      // ถ้ามีการอัปโหลดไฟล์รูปภาพใหม่
      if (req.file) {
        // ดึงชื่อไฟล์รูปภาพเดิมจากฐานข้อมูล
        const [rows] = await db.query("SELECT pic FROM users WHERE id = ?", [userId]);
        if (rows.length > 0 && rows[0].pic) {
            const oldImagePath = path.join(__dirname, 'src', 'img', rows[0].pic);
            // ลบไฟล์รูปภาพเก่าออกไป
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        pic = req.file.filename; // ใช้ชื่อไฟล์ใหม่แทน
      }

      const [result] = await db.query(
        "UPDATE users SET email = ?, password = ?, status = ?, dep = ?, pic = ? WHERE id = ?",
        [email, password, status, dep, pic, userId]
      );

      console.log("ผลลัพธ์การแก้ไข:", result);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
      }
      res.status(200).json({ message: "แก้ไขข้อมูลผู้ใช้สำเร็จ" });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",
      });
    }
  });

  app.post("/insert", upload.single("photo"), async (req, res) => {
    try {
      const { email, password, status, dep } = req.body;
      const pic = req.file ? req.file.filename : null;

      const [result] = await db.query(
        "INSERT INTO users (email, password, status, dep, pic) VALUES (?, ?, ?, ?, ?)",
        [email, password, status, dep, pic]
      );

      res.status(200).json({
        status: "ok",
        result,
      });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "เกิดข้อผิดพลาด",
      });
    }
  });



  app.get("/users", authenticateToken, async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM users");
      res.json({ rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/login", async (req, res) => {
    try {
      console.log("req.body");
      console.log(req.body);
      const rows = await db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [req.body.email, req.body.password]
      );
      console.log("rows:", rows[0]);
      console.log("rows.length:", rows[0].length);
      if (rows[0].length === 0) {
        return res.status(401).json({
          status: "error",
          message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        });
      }
      console.log("เข้าสู่ระบบสำเร็จ");
      const user = rows[0][0];
      const token = jwt.sign({ id: user.id, email: user.email }, jwt_SECRET, { expiresIn: "1h" });
      console.log("token=", token)
      // res.send("login ok");
      res.status(200).json({
        status: "ok",
        // data: rows[0],
        token: token,
        message: "เข้าสู่ระบบสำเร็จ"
      });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", error);
      res.status(500).json({
        status: "error",
        message: error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      });
    }
  });
  // http://localhost:7000/list?fname=alonkorn
  app.get("/list", (req, res) => {
    console.log(req.query);
    res.send({
      data: req.query.fname,
      status: true,
    });
  });
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });