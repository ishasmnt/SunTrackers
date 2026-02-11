import { createContext, useContext, useState, useEffect } from 'react';

// Create language context
const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// Translations object - keep it as a named export
export const translations = {
  en: {
    // Navbar
    home: "HOME",
    awareness: "AWARENESS",
    calculator: "CALCULATOR",
    invest: "INVEST",
    chat: "CHAT",
    analysis: "ANALYSIS",
    login: "LOGIN",
    logout: "LOGOUT",
    profile: "PROFILE",
    
    // Home page
    heroBadge: "Dream West Java Progressing Towards Reality",
    heroTitle: "Welcome to the Green Future",
    heroSubtitle: "Empowering communities with sustainable solar energy solutions. Calculate savings, invest in local projects, and track our collective impact.",
    exploreSolutions: "Explore Solutions",
    seeExplanation: "See Explanation",
    howSolarWorks: "HOW SOLAR WORKS",
    harnessSun: "Harness the Sun's Power",
    solarDescription: "Solar panels convert sunlight into DC electricity. An inverter converts this into AC electricity, which powers your home. Excess energy flows back to the grid or charges your battery, ensuring you always have power when you need it.",
    cleanEnergy: "Clean Energy",
    costSavings: "Cost Savings",
    readMore: "Read More",
    planSolar: "Plan Solar",
    planSolarText: "Calculate potential costs & savings for your school or home. Get a personalized estimate tailored to West Java's sunlight data",
    openCalculator: "Open Calculator",
    investTitle: "Invest",
    investText: "Fund community solar projects and earn green returns. Empower local growth while contributing to a sustainable grid.",
    browseProjects: "Browse Projects",
    impactAnalysis: "Impact Analysis",
    impactText: "Track West Java's carbon reduction progress visually. See real-time data on energy generation and environmental benefits.",
    viewDashboard: "View Dashboard",
    knowledgeCenter: "KNOWLEDGE CENTER",
    solarInsights: "Solar Insights",
    insightsSubtitle: "Stay updated with the latest in solar technology, community stories, and sustainable living tips in West Java.",
    viewAllArticles: "View All Articles →",
    
    // Chat page
    chatTitle: "AI Solar Assistant",
    chatSubtitle: "Your expert guide to renewable energy in West Java.",
    chatHint: "Try asking about",
    chatHint2: "or",
    chatPlaceholder: "Ask about solar sizing, payback, investments, or navigation...",
    chatWelcome: "Hello! I'm your AI Solar Assistant for PowerWestJava.\n\nI can help you with:\n• Solar system sizing and costs\n• Investment opportunities\n• Energy savings calculations\n• West Java solar policies\n• Platform navigation\n\n💬 Saya juga bisa berbahasa Indonesia! Feel free to ask in English or Bahasa Indonesia.\n\nHow can I help you today?",
    quickNavLabel: "Quick Navigation:",
    aiThinking: "AI is thinking...",
    aiDisclaimer: "This AI assistant provides educational information. For official advice, consult certified solar professionals.",
    
    // Login page
    welcomeBack: "Welcome back",
    signInContinue: "Sign in to continue to PowerWestJava",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    signIn: "Sign In",
    createAccount: "Create Account",
    continueWithGoogle: "Continue with Google",
    
    // Common
    loading: "Loading...",
    error: "Error",
    tryAgain: "Try Again",
    
    // Planner page
    solarCalculator: "Solar Calculator",
    calcSubtitle: "Estimate solar savings, payback, and community-funded options.",
    calcIntro: "This calculator uses a capacity range of",
    calcIntro2: "to represent a typical initial installation in a small to medium-sized school, with a target energy offset of approximately",
    calcIntro3: "in line with the common practice of phased installations before large-scale system expansion.",
    monthlyBill: "Monthly Electricity Bill (IDR)",
    billPlaceholder: "e.g. 2000000",
    districtLabel: "District / Location",
    districtHelp: "Used to estimate local sun hours and typical installed cost for your area.",
    userTypeLabel: "User Type",
    userTypeHelp: "Affects the electricity tariff and the target offset used to size the solar system.",
    roofSizeLabel: "Roof Size",
    roofSizeHelp: "A simple proxy for available roof area. It limits the maximum system size we can recommend.",
    shadingLabel: "Shading",
    shadingHelp: "Shading reduces solar output. Choose Medium/Heavy if trees or buildings shade the roof during peak hours.",
    financingLabel: "Financing",
    financingHelp: "Direct means you pay upfront and keep the savings. Community means Rp 0 upfront, but savings are shared via a green fee.",
    financingHelpHH: "Community financing is currently available only for schools and MSMEs.",
    grantCoverage: "Grant Coverage",
    grantHelp: "The percentage of upfront cost covered by grants or subsidies. Higher coverage lowers payback time.",
    notAvailable: "Not available",
    calculating: "Calculating...",
    calculateSavings: "Calculate Savings",
    quickPreview: "Quick preview",
    estSavings: "Est. savings",
    aiConsultantNote: "AI Consultant's Note",
    analysisResult: "Analysis Result",
    fillInputsThenCalculate: "Fill the inputs, then calculate.",
    emptyTitle: "You'll see system size, estimated cost, payback, bill reduction, CO₂ impact, and the full breakdown here.",
    tipChangeShading: "Try changing shading and roof size to see the difference.",
    tipCommunityFunded: "Select 'Community Funded' to simulate Rp 0 upfront cost.",
    systemSize: "System Size",
    upfrontCost: "Upfront Cost",
    estimatedCost: "Estimated Cost",
    coveredByCommunity: "covered by community",
    estCapex: "est. capex",
    monthlySavings: "Monthly Savings",
    netToSchool: "net to school",
    billReductionValue: "bill reduction value",
    payback: "Payback",
    zeroYears: "0 years",
    noUpfrontSpend: "no upfront spend",
    simpleEstimate: "simple estimate",
    billReduction: "Bill Reduction",
    basedOnTariff: "based on tariff estimate",
    co2Reduced: "CO₂ Reduced",
    estimatedAnnual: "Estimated annual emissions avoided based on your solar energy production. Uses an emissions factor per kWh (grid average assumption).",
    howWeEstimated: "How we estimated this",
    panels: "Panels",
    assumptions: "Assumptions",
    nextSteps: "Next steps",
    placementOpt: "Placement & optimizations",
    missingInput: "Missing input",
    invalidAmount: "Invalid amount",
    
    // Invest page
    communityFinancing: "Community Financing",
    investSubtitle: "Invest in local solar projects and earn green returns.",
    raised: "Raised",
    investAmount: "Invest Rp 500.000",
    
    // Analysis page
    impactDashboard: "Impact Dashboard",
    analysisSubtitle: "Real-time monitoring of West Java's transition to sustainable energy. Track savings, generation, & environmental impact.",
    shareWhatsApp: "Share to WhatsApp",
    viewSchool: "School",
    viewAdmin: "Admin",
    dataMeta: "Data Meta-Tag:",
    
    // Profile page
    myProfile: "My Profile",
    emailAddress: "email address",
    investments: "My Investments",
    totalInvested: "Total Invested",
    projectsFunded: "Projects Funded",
    memberSince: "Member Since",
    editProfile: "Edit Profile",
    settings: "Settings",
    notifications: "Notifications",
    helpSupport: "Help & Support",
    logout: "Logout",
    investHistory: "Invest History",
    noHistory: "There is no history of investment/donation.",
    amountDonated: "Amount Donated (Rp)",
    date: "Date",
    changeEmail: "Change Email",
    currentEmail: "Current Email",
    newEmail: "New Email",
    newEmailPlaceholder: "newemail@example.com",
    updateEmail: "Update Email",
    emailValidHint: "The email must be in a valid format. The new email cannot already be used for another account.",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    passwordHint: "Password must be at least 8 characters, must contain at least 1 number and 1 symbol.",
    
    // Articles page
    knowledgeCenter: "Knowledge Center",
    articlesSubtitle: "Stay updated with the latest in solar technology, community stories, and sustainable living tips in West Java.",
    recentArticles: "Recent Articles",
    readMore: "Read More",
    backToArticles: "Back to Articles",
    latestInsights: "Latest Insights",
    articles: "Articles",
    home: "Home",
    viewAllVendors: "View All Vendors",
    solarVendors: "Solar Vendors in West Java",
    vendorSubtitle: "Solar panel vendors across Bandung, Bekasi, Cirebon, and Bogor.",
    vendorDisclaimer: "Users are advised to independently verify vendors before making any transactions. All transactions conducted between users and vendors are outside of our responsibility. This website is created for academic purposes and does not guarantee the legitimacy of vendors.",
    westJavaDirectory: "West Java Directory",
    website: "Website",
  },
  id: {
    // Navbar
    home: "BERANDA",
    awareness: "EDUKASI",
    calculator: "KALKULATOR",
    invest: "INVESTASI",
    chat: "OBROLAN",
    analysis: "ANALISIS",
    login: "MASUK",
    logout: "KELUAR",
    profile: "PROFIL",
    
    // Home page
    heroBadge: "Mimpi Jawa Barat Menjadi Nyata",
    heroTitle: "Selamat Datang di Masa Depan Hijau",
    heroSubtitle: "Memberdayakan komunitas dengan solusi energi surya berkelanjutan. Hitung tabungan, investasikan proyek lokal, dan lacak dampak kolektif kita.",
    exploreSolutions: "Jelajahi Solusi",
    seeExplanation: "Lihat Penjelasan",
    howSolarWorks: "CARA KERJA SURYA",
    harnessSun: "Manfaatkan Kekuatan Matahari",
    solarDescription: "Panel surya mengubah sinar matahari menjadi listrik DC. Inverter mengubahnya menjadi listrik AC yang menyalakan rumah Anda. Energi berlebih mengalir kembali ke jaringan atau mengisi baterai Anda, memastikan Anda selalu memiliki daya saat dibutuhkan.",
    cleanEnergy: "Energi Bersih",
    costSavings: "Penghematan Biaya",
    readMore: "Baca Selengkapnya",
    planSolar: "Rencanakan Surya",
    planSolarText: "Hitung potensi biaya & tabungan untuk sekolah atau rumah Anda. Dapatkan estimasi yang dipersonalisasi disesuaikan dengan data sinar matahari Jawa Barat",
    openCalculator: "Buka Kalkulator",
    investTitle: "Investasi",
    investText: "Danai proyek surya komunitas dan hasilkan keuntungan hijau. Dorong pertumbuhan lokal sambil berkontribusi pada jaringan yang berkelanjutan.",
    browseProjects: "Jelajahi Proyek",
    impactAnalysis: "Analisis Dampak",
    impactText: "Lacak kemajuan pengurangan karbon Jawa Barat secara visual. Lihat data real-time tentang generasi energi dan manfaat lingkungan.",
    viewDashboard: "Lihat Dasbor",
    knowledgeCenter: "PUSAT PENGETAHUAN",
    solarInsights: "Wawasan Surya",
    insightsSubtitle: "Tetap terupdate dengan teknologi surya terbaru, cerita komunitas, dan tips hidup berkelanjutan di Jawa Barat.",
    viewAllArticles: "Lihat Semua Artikel →",
    
    // Chat page
    chatTitle: "Asisten Surya AI",
    chatSubtitle: "Panduan ahli Anda untuk energi terbarukan di Jawa Barat.",
    chatHint: "Coba tanyakan tentang",
    chatHint2: "atau",
    chatPlaceholder: "Tanyakan tentang ukuran surya, payback, investasi, atau navigasi...",
    chatWelcome: "Halo! Saya Asisten Surya AI Anda untuk PowerWestJava.\n\nSaya dapat membantu Anda dengan:\n• Penentuan ukuran dan biaya sistem surya\n• Peluang investasi\n• Perhitungan penghematan energi\n• Kebijakan surya Jawa Barat\n• Navigasi platform\n\n💬 Saya juga bisa berbahasa Inggris! Silakan bertanya dalam Bahasa Indonesia atau English.\n\nBagaimana saya dapat membantu Anda hari ini?",
    quickNavLabel: "Navigasi Cepat:",
    aiThinking: "AI sedang berpikir...",
    aiDisclaimer: "Asisten AI ini memberikan informasi pendidikan. Untuk saran resmi, konsultasikan dengan profesional surya bersertifikat.",
    
    // Login page
    welcomeBack: "Selamat datang kembali",
    signInContinue: "Masuk untuk melanjutkan ke PowerWestJava",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Kata Sandi",
    signIn: "Masuk",
    createAccount: "Buat Akun",
    continueWithGoogle: "Lanjutkan dengan Google",
    
    // Common
    loading: "Memuat...",
    error: "Kesalahan",
    tryAgain: "Coba Lagi",
    
    // Planner page
    solarCalculator: "Kalkulator Surya",
    calcSubtitle: "Perkirakan penghematan surya, payback, dan opsi pendanaan komunitas.",
    calcIntro: "Kalkulator ini menggunakan rentang kapasitas",
    calcIntro2: "untuk mewakili instalasi awal yang khas di sekolah kecil hingga menengah, dengan target offset energi sekitar",
    calcIntro3: "sesuai dengan praktik umum instalasi bertahap sebelum ekspansi sistem skala besar.",
    monthlyBill: "Tagihan Listrik Bulanan (IDR)",
    billPlaceholder: "contoh: 2000000",
    districtLabel: "Kabupaten / Lokasi",
    districtHelp: "Digunakan untuk memperkirakan jam matahari lokal dan biaya instalasi khas untuk daerah Anda.",
    userTypeLabel: "Jenis Pengguna",
    userTypeHelp: "Mempengaruhi tarif listrik dan target offset yang digunakan untuk menentukan ukuran sistem surya.",
    roofSizeLabel: "Ukuran Atap",
    roofSizeHelp: "Proksi sederhana untuk luas atap yang tersedia. Ini membatasi ukuran sistem maksimum yang dapat kami rekomendasikan.",
    shadingLabel: "Naungan",
    shadingHelp: "Naungan mengurangi output surya. Pilih Medium/Berat jika pohon atau bangunan menghalangi atap saat jam-jam puncak.",
    financingLabel: "Pembiayaan",
    financingHelp: "Langsung berarti Anda membayar di muka dan menyimpan penghematan. Komunitas berarti Rp 0 di muka, tetapi penghematan dibagikan melalui biaya hijau.",
    financingHelpHH: "Pembiayaan komunitas saat ini hanya tersedia untuk sekolah dan UMKM.",
    grantCoverage: "Cakupan Hibah",
    grantHelp: "Persentase biaya di muka yang ditutupi oleh hibah atau subside. Cakupan lebih tinggi mempersingkat waktu pengembalian.",
    notAvailable: "Tidak tersedia",
    calculating: "Menghitung...",
    calculateSavings: "Hitung Penghematan",
    quickPreview: "Pratinjau cepat",
    estSavings: "Perk. penghematan",
    aiConsultantNote: "Catatan Konsultan AI",
    analysisResult: "Hasil Analisis",
    fillInputsThenCalculate: "Isi input, lalu hitung.",
    emptyTitle: "Anda akan melihat ukuran sistem, estimasi biaya, payback, pengurangan tagihan, dampak CO2, dan rincian lengkap di sini.",
    tipChangeShading: "Coba ubah naungan dan ukuran atap untuk melihat perbedaannya.",
    tipCommunityFunded: "Pilih 'Didanai Komunitas' untuk mensimulasikan biaya di muka Rp 0.",
    systemSize: "Ukuran Sistem",
    upfrontCost: "Biaya di Muka",
    estimatedCost: "Estimasi Biaya",
    coveredByCommunity: "ditutupi oleh komunitas",
    estCapex: "perk. capex",
    monthlySavings: "Penghematan Bulanan",
    netToSchool: "bersih ke sekolah",
    billReductionValue: "nilai pengurangan tagihan",
    payback: "Pengembalian",
    zeroYears: "0 tahun",
    noUpfrontSpend: "tanpa biaya di muka",
    simpleEstimate: "perkiraan sederhana",
    billReduction: "Pengurangan Tagihan",
    basedOnTariff: "berdasarkan perkiraan tarif",
    co2Reduced: "CO2 Dikurangi",
    estimatedAnnual: "Perkiraan emisi tahunan yang dihindari berdasarkan produksi energi surya Anda. Menggunakan faktor emisi per kWh (asumsi rata-rata jaringan).",
    howWeEstimated: "Bagaimana kami menghitung ini",
    panels: "Panel",
    assumptions: "Asumsi",
    nextSteps: "Langkah selanjutnya",
    placementOpt: "Penempatan & optimasi",
    missingInput: "Input hilang",
    invalidAmount: "Jumlah tidak valid",
    
    // Invest page
    communityFinancing: "Pendanaan Komunitas",
    investSubtitle: "Investasikan proyek surya lokal dan hasilkan keuntungan hijau.",
    raised: "Terdanai",
    investAmount: "Investasi Rp 500.000",
    
    // Analysis page
    impactDashboard: "Dasbor Dampak",
    analysisSubtitle: "Pemantauan real-time transisi Jawa Barat ke energi berkelanjutan. Lacak penghematan, generasi, & dampak lingkungan.",
    shareWhatsApp: "Bagikan ke WhatsApp",
    viewSchool: "Sekolah",
    viewAdmin: "Admin",
    dataMeta: "Meta-Tag Data:",
    
    // Profile page
    myProfile: "Profil Saya",
    emailAddress: "alamat email",
    investments: "Investasi Saya",
    totalInvested: "Total Investasi",
    projectsFunded: "Proyek Terdanai",
    memberSince: "Anggota Sejak",
    editProfile: "Edit Profil",
    settings: "Pengaturan",
    notifications: "Notifikasi",
    helpSupport: "Bantuan & Dukungan",
    logout: "Keluar",
    investHistory: "Riwayat Investasi",
    noHistory: "Tidak ada riwayat investasi/donasi.",
    amountDonated: "Jumlah Disumbangkan (Rp)",
    date: "Tanggal",
    changeEmail: "Ubah Email",
    currentEmail: "Email Saat Ini",
    newEmail: "Email Baru",
    newEmailPlaceholder: "email baru@example.com",
    updateEmail: "Perbarui Email",
    emailValidHint: "Email harus dalam format yang valid. Email baru tidak boleh sudah digunakan untuk akun lain.",
    changePassword: "Ubah Kata Sandi",
    newPassword: "Kata Sandi Baru",
    confirmPassword: "Konfirmasi Kata Sandi",
    updatePassword: "Perbarui Kata Sandi",
    passwordHint: "Kata sandi harus minimal 8 karakter, harus mengandung minimal 1 angka dan 1 simbol.",
    
    // Articles page
    knowledgeCenter: "Pusat Pengetahuan",
    articlesSubtitle: "Tetap terupdate dengan teknologi surya terbaru, cerita komunitas, dan tips hidup berkelanjutan di Jawa Barat.",
    recentArticles: "Artikel Terbaru",
    readMore: "Baca Selengkapnya",
    backToArticles: "Kembali ke Artikel",
    latestInsights: "Wawasan Terbaru",
    articles: "Artikel",
    home: "Beranda",
    viewAllVendors: "Lihat Semua Vendor",
    solarVendors: "Vendor Surya di Jawa Barat",
    vendorSubtitle: "Vendor panel surya di Bandung, Bekasi, Cirebon, dan Bogor.",
    vendorDisclaimer: "Pengguna disarankan untuk memverifikasi vendor secara independen sebelum melakukan transaksi. Semua transaksi yang dilakukan antara pengguna dan vendor di luar tanggung jawab kami. Situs web ini dibuat untuk tujuan akademis dan tidak menjamin keabsahan vendor.",
    westJavaDirectory: "Direktori Jawa Barat",
    website: "Situs Web",
  }
};

// Language provider component
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try to get from localStorage, default to English
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;

