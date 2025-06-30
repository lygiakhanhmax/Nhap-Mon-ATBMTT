class SecureAudioTransfer {
    constructor() {
        // KHỞI TẠO CÁC THUỘC TÍNH CHÍNH
        this.audioFile = null;           
        this.rsaKeyPair = null;          
        this.sessionKey = null;          
        this.segments = [];              
        this.originalFileData = null;    
        
        // KHỞI TẠO GIAO DIỆN VÀ SỰ KIỆN
        this.initializeElements();       
        this.bindEvents();              
        this.addLog('🚀 Hệ thống khởi động hoàn tất', 'info');
    }

    initializeElements() {
        // CÁC ELEMENTS LIÊN QUAN ĐĂN UPLOAD FILE
        this.fileUploadArea = document.getElementById('fileUploadArea');   
        this.audioFileInput = document.getElementById('audioFile');        
        this.fileInfo = document.getElementById('fileInfo');               
        
        // CÁC NÚT ĐIỀU KHIỂN CHÍNH
        this.generateKeysBtn = document.getElementById('generateKeysBtn');  
        this.startTransferBtn = document.getElementById('startTransferBtn'); 
        this.resetBtn = document.getElementById('resetBtn');                
        this.downloadBtn = document.getElementById('downloadBtn');          
        this.verifyBtn = document.getElementById('verifyBtn');              
        
        // CÁC ELEMENTS HIỂN THỊ TIẾN TRÌNH VÀ TRẠNG THÁI
        this.progressSection = document.getElementById('progressSection');  
        this.progressFill = document.getElementById('progressFill');        
        this.progressText = document.getElementById('progressText');       
        this.receiverStatus = document.getElementById('receiverStatus');    
        this.segmentList = document.getElementById('segmentList');         
        this.verificationResult = document.getElementById('verificationResult'); 
        
        // CONTAINER HIỂN THỊ LOG
        this.logContainer = document.getElementById('logContainer');        
    }

    bindEvents() {
        // SỰ KIỆN LIÊN QUAN ĐẾN UPLOAD FILE
        this.fileUploadArea.addEventListener('click', () => this.audioFileInput.click());
        
        // Xử lý kéo file vào vùng upload
        this.fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.fileUploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        // Xử lý khi chọn file từ dialog
        this.audioFileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // SỰ KIỆN CÁC NÚT ĐIỀU KHIỂN
        this.generateKeysBtn.addEventListener('click', this.generateRSAKeys.bind(this));
        this.startTransferBtn.addEventListener('click', this.startTransfer.bind(this));
        this.resetBtn.addEventListener('click', this.resetApplication.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadReconstructedFile.bind(this));
        this.verifyBtn.addEventListener('click', this.verifyIntegrity.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();  
        this.fileUploadArea.classList.add('dragover');  
    }

    handleDrop(e) {
        e.preventDefault();  
        this.fileUploadArea.classList.remove('dragover'); 
        const files = e.dataTransfer.files;  
        if (files.length > 0) {
            this.handleFile(files[0]);  
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];  // Lấy file được chọn
        if (file) {
            this.handleFile(file);  // Xử lý file
        }
    }

    /**
     * Xử lý file được chọn - kiểm tra và lưu trữ
     * @param {File} file - File object từ HTML5 File API
     */
    async handleFile(file) {
        // KIỂM TRA ĐỊNH DẠNG FILE
        if (!file.type.startsWith('audio/')) {
            this.addLog('❌ Lỗi: Vui lòng chọn file âm thanh hợp lệ', 'error');
            return;
        }

        // LÀU TRỮ FILE VÀ CHUYỂN ĐỔI SANG ARRAYBUFFER
        this.audioFile = file;  
        this.originalFileData = await this.fileToArrayBuffer(file);  
        
        // HIỂN THỊ THÔNG TIN FILE
        this.displayFileInfo(file);
        this.addLog(`📁 Đã chọn file: ${file.name} (${this.formatFileSize(file.size)})`, 'info');
        
        // KÍCH HOẠT NÚT TẠO KHÓA
        this.generateKeysBtn.disabled = false;
    }

    /**
     * Hiển thị thông tin chi tiết của file
     * @param {File} file - File object
     */
    displayFileInfo(file) {
        // CẬP NHẬT CÁC TRƯỜNG THÔNG TIN
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        
        const estimatedDuration = Math.floor(file.size / 16000);
        document.getElementById('fileDuration').textContent = `~${estimatedDuration}s`;
        
        // HIỂN THỊ SECTION THÔNG TIN FILE
        this.fileInfo.style.display = 'block';
    }

    async generateRSAKeys() {
        this.addLog('🔐 Đang tạo cặp khóa RSA 2048-bit...', 'info');
        this.generateKeysBtn.disabled = true; 
        
        try {
            // MÔ PHỎNG QUAÁ TRÌNH TẠO KHÓA (tốn thời gian)
            await this.simulateAsyncOperation(1000);
            
            // TẠO CẶP KHÓA GIẢ LẬP (trong thực tế dùng crypto library)
            this.rsaKeyPair = {
                publicKey: this.generateMockKey('public'),  
                privateKey: this.generateMockKey('private')  
            };
            
            this.addLog('✅ Cặp khóa RSA đã được tạo thành công', 'success');
            this.startTransferBtn.disabled = false;  
            
        } catch (error) {
            this.addLog('❌ Lỗi tạo khóa RSA: ' + error.message, 'error');
            this.generateKeysBtn.disabled = false;  
        }
    }

 
    async startTransfer() {
        this.addLog('📤 Bắt đầu quá trình truyền file an toàn...', 'info');
        this.startTransferBtn.disabled = true;          
        this.progressSection.style.display = 'block';   
        
        try {
            // CÁC BƯỚC THỰC HIỆN TUẦN TỰ
            await this.performHandshake();         
            await this.performAuthentication();     
            await this.processAndEncryptFile();    
            await this.sendSegments();             
            await this.completeTransfer();         
            
        } catch (error) {
            this.addLog('❌ Lỗi trong quá trình truyền: ' + error.message, 'error');
            this.resetTransferState();  // Reset trạng thái nếu có lỗi
        }
    }

  
    async performHandshake() {
        this.updateProgress(10, 'Bước 1: Handshake...');
        await this.simulateAsyncOperation(500);  
        
        // MÔ PHỎNG TRAO ĐỔI HANDSHAKE
        this.addLog('👋 Người gửi: "Hello!"', 'info');
        await this.simulateAsyncOperation(300);  
        
        this.addLog('📥 Người nhận: "Ready!"', 'success');
        this.updateReceiverStatus('🤝', 'Đã kết nối', 'Handshake thành công');
    }

    
    async performAuthentication() {
        this.updateProgress(25, 'Bước 2: Xác thực & trao đổi khóa...');
        await this.simulateAsyncOperation(800);
        
        // TẠO METADATA CỦA FILE
        const metadata = {
            filename: this.audioFile.name,                   
            timestamp: new Date().toISOString(),              
            duration: Math.floor(this.audioFile.size / 16000), 
            size: this.audioFile.size                         
        };
        
        // KÝ METADATA BẰNG RSA + SHA-512
        this.addLog('🔏 Đang ký metadata bằng RSA + SHA-512...', 'info');
        await this.simulateAsyncOperation(500);
        
        // TẠO KHÓA PHIÊN CHO TRIPLE DES
        this.sessionKey = this.generateSessionKey();
        this.addLog('🔑 SessionKey đã được tạo và mã hóa bằng RSA', 'success');
        
        this.updateReceiverStatus('🔐', 'Đã xác thực', 'Khóa phiên đã nhận');
    }

    
    async processAndEncryptFile() {
        this.updateProgress(40, 'Bước 3: Chia file và mã hóa...');
        
        // CHIA FILE THÀNH 3 ĐOẠN BẰNG NHAU
        const fileData = new Uint8Array(this.originalFileData);  
        const segmentSize = Math.ceil(fileData.length / 3);     
        
        this.segments = [];  // Reset mảng segments
        
        // XỬ LÝ TỪNG ĐOẠN
        for (let i = 0; i < 3; i++) {
            // TÍNH TOÁN VỊ TRÍ BẮT ĐẦU VÀ KẾT THÚC
            const start = i * segmentSize;
            const end = Math.min(start + segmentSize, fileData.length);
            const segmentData = fileData.slice(start, end);  // Cắt đoạn
            
            // TẠO IV (INITIALIZATION VECTOR) NGẪU NHIÊN
            const iv = this.generateIV();
            
            // MÃ HÓA BẰNG TRIPLE DES
            const encryptedData = await this.encryptWithTripleDES(segmentData, this.sessionKey, iv);
            
            // TÍNH HASH SHA-512 CHO IV + ENCRYPTED DATA
            const hash = await this.calculateSHA512(iv, encryptedData);
            
            // TẠO CHỮ KÝ RSA CHO HASH
            const signature = this.signWithRSA(hash);
            
            // LƯU TRỮ THÔNG TIN ĐOẠN
            this.segments.push({
                index: i + 1,                                   
                iv: this.arrayBufferToBase64(iv),               
                cipher: this.arrayBufferToBase64(encryptedData), 
                hash: hash,                                      
                signature: signature,                            
                originalData: segmentData                        
            });
            
            this.addLog(`📦 Đoạn ${i + 1}: Đã mã hóa (${encryptedData.length} bytes)`, 'info');
        }
        
        this.updateProgress(60, 'File đã được chia thành 3 đoạn và mã hóa');
    }

   
    async sendSegments() {
        this.segmentList.style.display = 'block';  // Hiển thị danh sách đoạn
        
        // GỬI TỪNG ĐOẠN
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            
            // CẬP NHẬT TIẾN TRÌNH
            this.updateProgress(70 + i * 8, `Đang gửi đoạn ${i + 1}/3...`);
            await this.simulateAsyncOperation(800);  // Mô phỏng thời gian truyền mạng
            
            // MÔ PHỎNG TRUYỀN MẠNG
            this.addLog(`📡 Gửi đoạn ${i + 1}: IV + Cipher + Hash + Signature`, 'info');
            
            // CẬP NHẬT TRẠNG THÁI ĐOẠN TẠI NGƯỜI NHẬN
            const segmentElement = document.getElementById(`segment${i + 1}`);
            const statusSpan = segmentElement.querySelector('.segment-status');
            statusSpan.textContent = '📥 Đã nhận';
            segmentElement.classList.add('received');  // Thêm class CSS
            
            await this.simulateAsyncOperation(300);  // Thời gian xử lý
            
            // KIỂM TRA TÍNH TOÀN VẸN ĐOẠN
            const isValid = await this.verifySegment(segment);
            if (isValid) {
                statusSpan.textContent = '✅ Hợp lệ';
                segmentElement.classList.add('verified');
                this.addLog(`✅ Đoạn ${i + 1}: Kiểm tra hash và chữ ký thành công`, 'success');
            } else {
                statusSpan.textContent = '❌ Lỗi';
                throw new Error(`Đoạn ${i + 1} không hợp lệ`);  // Dừng quá trình nếu lỗi
            }
        }
    }

 
    async completeTransfer() {
        this.updateProgress(95, 'Đang ghép file...');
        await this.simulateAsyncOperation(500);
        
        this.addLog('🔧 Đang giải mã và ghép các đoạn...', 'info');
        
        // GIẢI MÃ VÀ GHÉP FILE
        this.reconstructedFile = await this.reconstructFile();
        
        // HOÀN THÀNH
        this.updateProgress(100, 'Hoàn thành!');
        this.updateReceiverStatus('✅', 'Hoàn thành', 'File đã được nhận và ghép thành công');
        
        this.addLog('🎉 Truyền file hoàn tất! File đã được ghép thành công', 'success');
        this.addLog('📊 ACK được gửi đến người gửi', 'info');
        
        // KÍCH HOẠT CÁC NÚT CHỨC NĂNG
        this.downloadBtn.disabled = false;   // Cho phép tải xuống
        this.verifyBtn.disabled = false;     // Cho phép kiểm tra toàn vẹn
    }

  
    async reconstructFile() {
        const reconstructedSegments = [];
        
        // GIẢI MÃ TỪNG ĐOẠN
        for (const segment of this.segments) {
            // GIẢI MÃ TRIPLE DES
            const decryptedData = await this.decryptWithTripleDES(
                this.base64ToArrayBuffer(segment.cipher),  // Dữ liệu mã hóa
                this.sessionKey,                           // Khóa phiên
                this.base64ToArrayBuffer(segment.iv)       // IV
            );
            reconstructedSegments.push(decryptedData);
        }
        
        // GHÉP CÁC ĐOẠN LẠI
        const totalLength = reconstructedSegments.reduce((sum, segment) => sum + segment.length, 0);
        const reconstructed = new Uint8Array(totalLength);  // Tạo mảng đích
        let offset = 0;
        
        // SAO CHÉP TỪNG ĐOẠN VÀO MẢNG ĐÍCH
        for (const segment of reconstructedSegments) {
            reconstructed.set(segment, offset);  
            offset += segment.length;           
        }
        
        return reconstructed;
    }

   
    async verifyIntegrity() {
        this.addLog('🔍 Đang kiểm tra tính toàn vẹn của file...', 'info');
        
        // CHUYỂN ĐỔI DỮ LIỆU ĐỂ SO SÁNH
        const originalData = new Uint8Array(this.originalFileData);
        const reconstructedData = this.reconstructedFile;
        
        // SO SÁNH TỪNG BYTE
        let isIdentical = true;
        if (originalData.length !== reconstructedData.length) {
            isIdentical = false;  
        } else {
            // SO SÁNH TỪNG BYTE
            for (let i = 0; i < originalData.length; i++) {
                if (originalData[i] !== reconstructedData[i]) {
                    isIdentical = false;
                    break;  // Thoát sớm khi tìm thấy khác biệt
                }
            }
        }
        
        // HIỂN THỊ KẾT QUẢ
        const verificationText = document.getElementById('verificationText');
        const verificationResult = document.getElementById('verificationResult');
        
        if (isIdentical) {
            // FILE TOÀN VẸN
            verificationText.innerHTML = `
                <strong>✅ File toàn vẹn hoàn hảo!</strong><br>
                📊 Kích thước gốc: ${originalData.length} bytes<br>
                📊 Kích thước sau ghép: ${reconstructedData.length} bytes<br>
                🔒 Tất cả đoạn đã được xác thực thành công
            `;
            this.addLog('✅ Kiểm tra toàn vẹn: File giống hệt bản gốc', 'success');
        } else {
            // FILE BỊ LỖI
            verificationText.innerHTML = `
                <strong>❌ Phát hiện lỗi toàn vẹn!</strong><br>
                📊 Kích thước gốc: ${originalData.length} bytes<br>
                📊 Kích thước sau ghép: ${reconstructedData.length} bytes<br>
                ⚠️ File có thể đã bị thay đổi trong quá trình truyền
            `;
            this.addLog('❌ Kiểm tra toàn vẹn: File không khớp với bản gốc', 'error');
        }
        
        verificationResult.style.display = 'block';
    }

   
    downloadReconstructedFile() {
        if (!this.reconstructedFile) {
            this.addLog('❌ Không có file để tải xuống', 'error');
            return;
        }
        
        // TẠO BLOB TỪ DỮ LIỆU
        const blob = new Blob([this.reconstructedFile], { type: this.audioFile.type });
        const url = URL.createObjectURL(blob);  // Tạo URL tạm thời
        
        // TẠO ELEMENT <A> ĐỂ TẢI XUỐNG
        const a = document.createElement('a');
        a.href = url;
        a.download = `reconstructed_${this.audioFile.name}`;  // Tên file tải xuống
        document.body.appendChild(a);  
        a.click();                     
        document.body.removeChild(a);  
        URL.revokeObjectURL(url);      
        
        this.addLog(`💾 File đã được tải xuống: reconstructed_${this.audioFile.name}`, 'success');
    }

    
    resetApplication() {
        // XÓA TẤT CẢ DỮ LIỆU
        this.audioFile = null;
        this.rsaKeyPair = null;
        this.sessionKey = null;
        this.segments = [];
        this.originalFileData = null;
        this.reconstructedFile = null;
        
        // ẨN CÁC SECTION KHÔNG CẦN THIẾT
        this.fileInfo.style.display = 'none';
        this.progressSection.style.display = 'none';
        this.segmentList.style.display = 'none';
        this.verificationResult.style.display = 'none';
        
        // RESET TRẠNG THÁI CÁC NÚT
        this.generateKeysBtn.disabled = false;
        this.startTransferBtn.disabled = true;
        this.downloadBtn.disabled = true;
        this.verifyBtn.disabled = true;
        
        // RESET FILE INPUT
        this.audioFileInput.value = '';
        
        // RESET TRẠNG THÁI NGƯỜI NHẬN
        this.updateReceiverStatus('⏳', 'Chờ kết nối', 'Sẵn sàng nhận file từ người gửi');
        
        // RESET TRẠNG THÁI CÁC ĐOẠN
        for (let i = 1; i <= 3; i++) {
            const segmentElement = document.getElementById(`segment${i}`);
            const statusSpan = segmentElement.querySelector('.segment-status');
            statusSpan.textContent = '⏳ Chờ';
            segmentElement.classList.remove('received', 'verified');
        }
        
        this.logContainer.innerHTML = '<div class="log-entry">🚀 Hệ thống đã được reset...</div>';
        
        this.addLog('🔄 Hệ thống đã được khởi tạo lại', 'info');
    }

    /**
     * Cập nhật thanh tiến trình và text mô tả
     * @param {number} percentage 
     * @param {string} text 
     */
    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;  
        this.progressText.textContent = text;              
    }

    /**
     * Cập nhật trạng thái của người nhận
     * @param {string} icon 
     * @param {string} title 
     * @param {string} description
     */
    updateReceiverStatus(icon, title, description) {
        const statusCard = this.receiverStatus;
        statusCard.querySelector('.status-icon').textContent = icon;        
        statusCard.querySelector('h3').textContent = `Trạng thái: ${title}`; 
        statusCard.querySelector('p').textContent = description;             
    }

    /**
     * Thêm message vào log container
     * @param {string} message 
     * @param {string} type 
     */
    addLog(message, type = '') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;  // Thêm class CSS theo type
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.logContainer.appendChild(logEntry);   // Thêm vào container
        this.logContainer.scrollTop = this.logContainer.scrollHeight;  
    }

    /**
     * Format kích thước file thành đơn vị dễ đọc
     * @param {number} bytes 
     * @returns {string} 
     */
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));  // Tính chỉ số đơn vị
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Chuyển đổi File object thành ArrayBuffer
     * @param {File} file - File object từ HTML5 File API
     * @returns {Promise<ArrayBuffer>} Promise chứa binary data
     */
    fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);  
            reader.onerror = reject;                      
            reader.readAsArrayBuffer(file);                
        });
    }

    /**
     * Mô phỏng operation bất đồng bộ với delay
     * @param {number} delay 
     * @returns {Promise} 
     */
    simulateAsyncOperation(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Tạo khóa RSA giả lập cho demo
     * @param {string} type - Loại khóa ('public' hoặc 'private')
     * @returns {string} Khóa RSA dạng PEM giả lập
     */
    generateMockKey(type) {
        // TẠO CHUỖI NGẪU NHIÊN 64 KÝ TỰ (giả lập khóa Base64)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        for (let i = 0; i < 64; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // TRẢ VỀ ĐỊNH DẠNG PEM
        return `-----BEGIN ${type.toUpperCase()} KEY-----\n${result}\n-----END ${type.toUpperCase()} KEY-----`;
    }

    /**
     * Tạo khóa phiên 24-byte cho Triple DES
     * @returns {Uint8Array} Mảng 24 byte ngẫu nhiên
     */
    generateSessionKey() {
        const key = new Uint8Array(24);  // Triple DES cần 24 bytes (192 bits)
        for (let i = 0; i < 24; i++) {
            key[i] = Math.floor(Math.random() * 256);  // Byte ngẫu nhiên 0-255
        }
        return key;
    }

    /**
     * Tạo Initialization Vector 8-byte cho Triple DES
     * @returns {Uint8Array} Mảng 8 byte ngẫu nhiên
     */
    generateIV() {
        const iv = new Uint8Array(8);   
        for (let i = 0; i < 8; i++) {
            iv[i] = Math.floor(Math.random() * 256);  
        }
        return iv;
    }

    /**
     * Mã hóa dữ liệu bằng Triple DES (giả lập)
     * @param {Uint8Array} data - Dữ liệu cần mã hóa
     * @param {Uint8Array} key - Khóa 24-byte
     * @param {Uint8Array} iv - IV 8-byte
     * @returns {Promise<Uint8Array>} Dữ liệu đã mã hóa
     */
    async encryptWithTripleDES(data, key, iv) {
        // MÔ PHỎNG THỜI GIAN XỬ LÝ MÃ HÓA
        await this.simulateAsyncOperation(100);
        
        const encrypted = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
        }
        return encrypted;
    }

    /**
     * Giải mã dữ liệu bằng Triple DES (giả lập)
     * @param {Uint8Array} encryptedData - Dữ liệu đã mã hóa
     * @param {Uint8Array} key - Khóa 24-byte
     * @param {Uint8Array} iv - IV 8-byte
     * @returns {Promise<Uint8Array>} Dữ liệu đã giải mã
     */
    async decryptWithTripleDES(encryptedData, key, iv) {
        // MÔ PHỎNG THỜI GIAN XỬ LÝ GIẢI MÃ
        await this.simulateAsyncOperation(100);
        
        // THUẬT TOÁN GIẢI MÃ (NGƯỢC LẠI VỚI MÃ HÓA)
        const decrypted = new Uint8Array(encryptedData.length);
        for (let i = 0; i < encryptedData.length; i++) {
            decrypted[i] = encryptedData[i] ^ key[i % key.length] ^ iv[i % iv.length];
        }
        return decrypted;
    }

    /**
     * Tính hash SHA-512 cho IV + data (giả lập)
     * @param {Uint8Array} iv - Initialization Vector
     * @param {Uint8Array} data - Dữ liệu cần hash
     * @returns {Promise<string>} Hash SHA-512 dạng hex
     */
    async calculateSHA512(iv, data) {
        // MÔ PHỎNG THỜI GIAN TÍNH HASH
        await this.simulateAsyncOperation(50);
        
        // GHÉP IV VÀ DATA LẠI
        const combined = new Uint8Array(iv.length + data.length);
        combined.set(iv, 0);           
        combined.set(data, iv.length); 
        
        let hash = '';
        for (let i = 0; i < combined.length; i += 8) {
            const chunk = combined.slice(i, i + 8);                   
            const sum = chunk.reduce((a, b) => a + b, 0);              
            hash += sum.toString(16).padStart(4, '0');                
        }
        return hash.substring(0, 128); 
    }

    /**
     * Ký dữ liệu bằng RSA (giả lập)
     * @param {string} data - Dữ liệu cần ký (thường là hash)
     * @returns {string} Chữ ký RSA dạng Base64
     */
    signWithRSA(data) {
        // TẠO CHỮ KÝ GIẢ LẬP
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let signature = '';
        for (let i = 0; i < 88; i++) { // Chữ ký RSA thường có độ dài cố định
            signature += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return signature;
    }

    /**
     * Kiểm tra tính hợp lệ của một đoạn
     * @param {Object} segment 
     * @returns {Promise<boolean>} 
     */
    async verifySegment(segment) {
        // MÔ PHỎNG THỜI GIAN KIỂM TRA
        await this.simulateAsyncOperation(200);
        
        return Math.random() > 0.05;
    }

    /**
     * Chuyển ArrayBuffer thành chuỗi Base64
     * @param {ArrayBuffer|Uint8Array} buffer - Dữ liệu binary
     * @returns {string} Chuỗi Base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);  // Đảm bảo là Uint8Array
        let binary = '';
        
        // CHUYỂN TỪNG BYTE THÀNH CHUỖI
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        return btoa(binary);
    }

    /**
     * Chuyển chuỗi Base64 thành ArrayBuffer
     * @param {string} base64 
     * @returns {Uint8Array} 
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);                    
        const bytes = new Uint8Array(binary.length);  
        
        // CHUYỂN TỪNG KÝ TỰ THÀNH BYTE
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        
        return bytes;
    }

    resetTransferState() {
        this.startTransferBtn.disabled = false;                    
        this.progressSection.style.display = 'none';             
        this.updateReceiverStatus('❌', 'Lỗi truyền tải', 'Có lỗi xảy ra trong quá trình truyền');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.secureAudioApp = new SecureAudioTransfer();
});