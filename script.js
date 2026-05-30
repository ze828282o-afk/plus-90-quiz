// ==========================================================
// 1. إعدادات الربط بالسيرفر و Google Sign-In Identity
// ==========================================================
const SUPABASE_URL = 'https://iexxsjynvczokyvatfxq.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_Uvs4hZnBQ2gn-zKjids5LQ_urKwYwBW'; 
/// الـ Client ID الجديد والثابت بتاعك
const GOOGLE_CLIENT_ID = '715210407785-3brf62jg5rsd30fegc4ocugieln0vpqk.apps.googleusercontent.com';

let supabaseClient = null;
let currentUser = null;

// الانتظار حتى تحميل الـ HTML بالكامل قبل بدء التشغيل
document.addEventListener("DOMContentLoaded", () => {
    try {
        if (typeof supabase !== 'undefined' && supabase !== null) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    } catch (e) {
        console.log("السيرفر لم يتصل، اللعبة تعمل محلياً كزائر.");
    }

    // ربط وتسجيل الدخول عبر جوجل تلقائياً
    initializeGoogleAuth();
    initGame();
    fetchLeaderboard();
});

function initializeGoogleAuth() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "dark", size: "medium", text: "signin_with", shape: "rectangular" }
        );
    } else {
        // إعادة المحاولة بعد ثانية لو المكتبة اتأخرت
        setTimeout(initializeGoogleAuth, 1000);
    }
}

async function handleCredentialResponse(response) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
        });
        if (error) throw error;
        if (data?.user) {
            currentUser = data.user;
            updateUserUI(currentUser);
            loadUserProgress();
        }
    } catch (err) {
        console.error("فشل تسجيل الدخول بجوجل:", err.message);
    }
}

function updateUserUI(user) {
    const guestModeMsg = document.getElementById("guestModeMsg");
    const googleLoginContainer = document.getElementById("googleLoginContainer");
    const userProfileInfo = document.getElementById("userProfileInfo");
    const userAvatarImg = document.getElementById("userAvatarImg");
    const userProfileName = document.getElementById("userProfileName");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        if (guestModeMsg) guestModeMsg.style.display = "none";
        if (googleLoginContainer) googleLoginContainer.style.display = "none";
        if (userProfileInfo) userProfileInfo.classList.remove("hidden");
        if (logoutBtn) logoutBtn.classList.remove("hidden");

        if (userProfileName) userProfileName.innerText = user.user_metadata?.full_name || user.email;
        if (userAvatarImg) userAvatarImg.src = user.user_metadata?.avatar_url || 'favicon.png';
    }
}

if (document.getElementById("logoutBtn")) {
    document.getElementById("logoutBtn").onclick = async function() {
        if (supabaseClient) await supabaseClient.auth.signOut();
        location.reload();
    };
}

// ==========================================================
// 2. بنك الأسئلة الكامل لـ Z3Z3 Tactics (105 سؤال جاهز)
// ==========================================================
const questionsDatabase = [
  // ==================== مستوى المبتدئين (من 1 إلى 35) ====================
  { id: 1, text: "من هو أكثر مدرب فوزًا بدوري أبطال أوروبا؟", options: ["أليكس فيرغسون", "بيب غوارديولا", "كارلو أنشيلوتي", "زين الدين زيدان"], correct: 2, minLevel: 0 },
  { id: 2, text: "ما هو النادي الأكثر تتويجًا بالدوري الإنجليزي الممتاز？", options: ["ليفربول", "مانشستر يونايتد", "أرسنال", "مانشستر سيتي"], correct: 1, minLevel: 0 },
  { id: 3, text: "من سجل هدف 'يد الله' الشهير في كأس العالم 1986؟", options: ["بيليه", "مارادونا", "زين الدين زيدان", "جيف هيرست"], correct: 1, minLevel: 0 },
  { id: 4, text: "أي نادٍ إيطالي يُعجبه ويلقب باسم 'البيانكونيري'？", options: ["إنتر ميلان", "يوفنتوس", "ميلان", "روما"], correct: 1, minLevel: 0 },
  { id: 5, text: "من فاز بجائزة أفضل لاعب في العالم (ذا بيست) لعام 2023؟", options: ["كيليان مبابي", "إيرلينغ هالاند", "ليونيل ميسي", "فينيسيوس جونيور"], correct: 2, minLevel: 0 },
  { id: 6, text: "كم عدد أندية الدوري الإنجليزي الممتاز (البريميرليغ) في الموسم الواحد؟", options: ["18", "20", "22", "24"], correct: 1, minLevel: 0 },
  { id: 7, text: "من هو الهداف التاريخي لبطولات كأس العالم؟", options: ["رونالدو (البرازيلي)", "ميروسلاف كلوزه", "غيرد مولر", "جاست فونتين"], correct: 1, minLevel: 0 },
  { id: 8, text: "أين أقيمت بطولة كأس العالم لكرة القدم لعام 2022؟", options: ["قطر", "روسيا", "البرازيل", "جنوب أفريقيا"], correct: 0, minLevel: 0 },
  { id: 9, text: "أي منتخب أمريكي جنوبي يلقب بـ 'السامبا'؟", options: ["الأرجنتين", "البرازيل", "أوروغواي", "کلمبیا"], correct: 1, minLevel: 0 },
  { id: 10, text: "ما هو النادي الذي يرتدي قميصاً أحمر وأبيض في مدينة مدريد؟", options: ["ريال مدريد", "أتلتيكو مدريد", "خيتافي", "رايو فايكانو"], correct: 1, minLevel: 0 },
  { id: 11, text: "كم عدد بطولات كأس العالم التي فازت بها إيطاليا في تاريخها؟", options: ["2", "3", "4", "5"], correct: 2, minLevel: 0 },
  { id: 12, text: "من هو هداف نادي ريال مدريد التاريخي في كل المسابقات؟", options: ["راؤول غونزاليس", "كريم بنزيما", "كريستيانو رونالدو", "ألفريدو دي ستيفانو"], correct: 2, minLevel: 0 },
  { id: 13, text: "من هو هداف نادي برشلونة التاريخي؟", options: ["رونالدينيو", "ليونيل ميسي", "لويس سواريز", "صامويل إيتو"], correct: 1, minLevel: 0 },
  { id: 14, text: "ما هي الدولة التي فازت بأول نسخة لبطولة كأس العالم عام 1930؟", options: ["الأرجنتين", "البرازيل", "أوروغواي", "إيطاليا"], correct: 2, minLevel: 0 },
  { id: 15, text: "أي نادٍ إنجليزي يقع في لندن ويلقب بـ 'المدفعجية'؟", options: ["تشيلسي", "توتنهام", "أرسنال", "وست هام"], correct: 2, minLevel: 0 },
  { id: 16, text: "ما هو النادي الفرنسي الأكثر تتويجاً بلقب الدوري المحلي؟", options: ["باريس سان جيرمان", "مارسيليا", "ليون", "سانت إتيان"], correct: 0, minLevel: 0 },
  { id: 17, text: "كم عدد الكرات الذهبية (Ballon d'Or) التي حققها كريستيانو رونالدو؟", options: ["3", "4", "5", "6"], correct: 2, minLevel: 0 },
  { id: 18, text: "أي لاعب برازيلي شهير يلقب بـ 'الظاهرة'؟", options: ["رونالدينيو", "كريستيانو رونالدو", "رونالدو نازاريو", "روماريو"], correct: 2, minLevel: 0 },
  { id: 19, text: "ما هي الدولة الأكثر فوزاً ببطولة كأس العالم على مر التاريخ؟", options: ["ألمانيا", "إيطاليا", "الأرجنتين", "البرازيل"], correct: 3, minLevel: 0 },
  { id: 20, text: "في أي نادٍ إنجليزي بدأ كريستيانو رونالدو مسيرته في البريميرليغ؟", options: ["أرسنال", "تشيلسي", "مانشستر يونايتد", "ليفربول"], correct: 2, minLevel: 0 },
  { id: 21, text: "من هو هداف الدوري الإنجليزي الممتاز التاريخي (البريميرليغ)؟", options: ["هاري كين", "ألان شيرر", "واين روني", "تييري هنري"], correct: 1, minLevel: 0 },
  { id: 22, text: "ما هو اللقب الشهير لنادي تشيلسي الإنجليزي؟", options: ["البلوز", "الريدز", "السبيرز", "التوفيز"], correct: 0, minLevel: 0 },
  { id: 23, text: "أي نادٍ عربي وأفريقي يسمى بنادي القرن في أفريقيا؟", options: ["الزمالك", "الرجاء", "الأهلي المصري", "الترجي"], correct: 2, minLevel: 0 },
  { id: 24, text: "ملعب 'الكامب نو' هو المعقل التاريخي لأي نادٍ أوروبي؟", options: ["ريال مدريد", "أتلتيكو مدريد", "برشلونة", "فالنسيا"], correct: 2, minLevel: 0 },
  { id: 25, text: "من هو المدرب الأسطوري لمانشستر يونايتد الذي قادهم لأكثر من 26 عاماً؟", options: ["أليكس فيرغسون", "أرسين فينجر", "جوزيه مورينيو", "مات بسبي"], correct: 0, minLevel: 0 },
  { id: 26, text: "ما هو النادي المصري الذي يلقب بـ 'الدراويش'؟", options: ["الزمالك", "الإسماعيلي", "الاتحاد السكندري", "المصري"], correct: 1, minLevel: 0 },
  { id: 27, text: "من هو اللاعب الذي يلقب بـ 'البرغوث'؟", options: ["كريستيانو رونالدو", "نيمار داسيلفا", "ليونيل ميسي", "لويس سواريز"], correct: 2, minLevel: 0 },
  { id: 28, text: "أي منتخب فاز بكأس أمم أوروبا (يورو 2020) التي أقيمت في 2021؟", options: ["إنجلترا", "إيطاليا", "إسبانيا", "فرنسا"], correct: 1, minLevel: 0 },
  { id: 29, text: "ما هو اللون الأساسي لقميص نادي ليفربول على أرضه？", options: ["الأزرق", "الأبيض", "الأحمر", "الأخضر"], correct: 2, minLevel: 0 },
  { id: 30, text: "من هو شريك النجم محمد صلاح التاريخي في هجوم ليفربول وغادر لبايرن ثم النصر؟", options: ["ساديو ماني", "روبرتو فيرمينو", "لويس دياز", "ديوغو جوتا"], correct: 0, minLevel: 0 },
  { id: 31, text: "كم عدد شوطي المباراة الرسمية في كرة القدم بدون أشواط إضافية؟", options: ["شوط واحد", "شوطين", "3 أشواط", "4 أشواط"], correct: 1, minLevel: 0 },
  { id: 32, text: "أي نادٍ سعودي يلقب بـ 'العالمي' ويلعب له كريستيانو رونالدو؟", options: ["الهلال", "الاتحاد", "النصر", "الأهلي"], correct: 2, minLevel: 0 },
  { id: 33, text: "ما هي المدة الزمنية للشوط الواحد الأصلي في مباراة كرة القدم؟", options: ["30 دقيقة", "40 دقيقة", "45 دقيقة", "60 دقيقة"], correct: 2, minLevel: 0 },
  { id: 34, text: "من هو النجم البلجيكي الذي كان قائداً لمانشستر سيتي واعتزل في أندرلخت؟", options: ["إيدين هازارد", "فينسنت كومباني", "كيفين دي بروين", "روميلو لوكاكو"], correct: 1, minLevel: 0 },
  { id: 35, text: "أي لاعب يحمل شارة القيادة لمنتخب مصر الأول حالياً؟", options: ["محمود تريزيغيه", "أحمد حجازي", "محمد صلاح", "مصطفى محمد"], correct: 2, minLevel: 0 },

  // ==================== المستوى المتوسط التكتيكي (من 36 إلى 70) ====================
  { id: 36, text: "من هو اللاعب الوحيد الذي فاز بالكرة الذهبية وهو يلعب في مركز حارس مرمى؟", options: ["مانويل نوير", "جانلويجي بوفون", "ليف ياشين", "بيتر شمايكل"], correct: 2, minLevel: 20 },
  { id: 37, text: "من هو هداف الدوري الإسباني (لا ليغا) تاريخيًا؟", options: ["كريستيانو رونالدو", "ليونيل ميسي", "تيلمو زارا", "راؤول غونزاليس"], correct: 1, minLevel: 20 },
  { id: 38, text: "من صاحب أطول سلسلة عدم خسارة في تاريخ الدوري الإنجليزي الممتاز؟", options: ["أرسنال", "مانشستر يونايتد", "تشيلسي", "ليفربول"], correct: 0, minLevel: 20 },
  { id: 39, text: "أي نادٍ فاز بلقب كأس العالم للأندية لعام 2023؟", options: ["ريال مدريد", "مانشستر سيتي", "تشيلسي", "فلامنغو"], correct: 1, minLevel: 20 },
  { id: 40, text: "من هو المدرب الذكي الذي قاد اليونان للفوز الإعجازي بـ يورو 2004؟", options: ["أوتو ريهاغل", "غوس هيدينك", "فابيو كابيلو", "كلود لو روا"], correct: 0, minLevel: 20 },
  { id: 41, text: "أي دولة فازت ببطولة كأس العالم 2014 التي أقيمت في البرازيل؟", options: ["الأرجنتين", "البرازيل", "ألمانيا", "هولندا"], correct: 2, minLevel: 20 },
  { id: 42, text: "من هو أكثر لاعب ظهوراً ومشاركة في مباريات تاريخ كأس العالم؟", options: ["ليونيل ميسي", "كريستيانو رونالدو", "لوثار ماتيوس", "جانلويجي بوفون"], correct: 0, minLevel: 20 },
  { id: 43, text: "أي نادٍ إيطالي عريق وعالمي يُلقب بـ 'السيدة العجوز'؟", options: ["ميلان", "إنتر ميلان", "يوفنتوس", "روما"], correct: 2, minLevel: 20 },
  { id: 44, text: "من هو اللاعب الأفريقي الوحيد في التاريخ الذي فاز بجائزة الكرة الذهبية؟", options: ["صامويل إيتو", "ديديه دروغبا", "جورج ويا", "محمد صلاح"], correct: 2, minLevel: 20 },
  { id: 45, text: "أي منتخب عربي توج بلقب كأس أمم أفريقيا لعام 2019 في مصر؟", options: ["مصر", "السنغال", "الجزائر", "نيجيريا"], correct: 2, minLevel: 20 },
  { id: 46, text: "ما هو النادي الألماني الوحيد الذي فاز بدوري الأبطال غير بايرن ميونخ وهامبورغ؟", options: ["بوروسيا دورتموند", "باير ليفركوزن", "شالكه", "فيردر بريمن"], correct: 0, minLevel: 20 },
  { id: 47, text: "من هو هداف دوري أبطال أوروبا التاريخي؟", options: ["ليونيل ميسي", "كريستيانو رونالدو", "روبرت ليفاندوفسكي", "كريم بنزيما"], correct: 1, minLevel: 20 },
  { id: 48, text: "أي لاعب يلقب بـ 'النفاثة الفنلندية' وصنع مجداً كبيراً مع ليفربول؟", options: ["ياري ليتمانن", "سامي هيبيا", "تيمو بوكي", "ميكائيل فورسيل"], correct: 0, minLevel: 20 },
  { id: 49, text: "من المدرب الذي قاد تشيلسي كبديل لتحقيق أول لقب دوري أبطال أوروبا عام 2012؟", options: ["جوزيه مورينيو", "روبرتو دي ماتيو", "توماس توخيل", "كارلو أنشيلوتي"], correct: 1, minLevel: 20 },
  { id: 50, text: "من هو اللاعب العربي الأكثر تسجيلاً للأهداف في تاريخ دوري أبطال أوروبا？", options: ["رباح ماجر", "رياض محرز", "محمد صلاح", "حكيم زياش"], correct: 2, minLevel: 20 },
  { id: 51, text: "أي نادٍ إنجليزي هو الوحيد من لندن الذي فاز بدوري الأبطال قبل عام 2020؟", options: ["أرسنال", "توتنهام", "تشيلسي", "وست هام"], correct: 2, minLevel: 20 },
  { id: 52, text: "من هو أصغر لاعب يسجل هدفاً في تاريخ بطولات كأس العالم لكرة القدم؟", options: ["بيليه", "كيليان مبابي", "ليونيل ميسي", "مايكل أوين"], correct: 0, minLevel: 20 },
  { id: 53, text: "ما هو النادي الاسكتلندي العريق الذي حقق لقب دوري أبطال أوروبا عام 1967؟", options: ["رينجرز", "سلتيك", "أبردين", "هارتس"], correct: 1, minLevel: 20 },
  { id: 54, text: "كم عدد ألقاب منتخب ألمانيا (الماكينات) في بطولة كأس العالم؟", options: ["3", "4", "5", "2"], correct: 1, minLevel: 20 },
  { id: 55, text: "لاعب دولي كبير ومثير للجدل لعب لبرشلونة، ريال مدريد، إنتر ميلان، وميلان؟", options: ["لويس فيغو", "رونالدو نازاريو", "زلاتان إبراهيموفيتش", "أندريا بيرلو"], correct: 1, minLevel: 20 },
  { id: 56, text: "أي نادٍ إنجليزي فاجأ العالم وحقق لقب البريميرليغ الإعجازي عام 2016؟", options: ["توتنهام", "ليستر سيتي", "إيفرتون", "وست هام"], correct: 1, minLevel: 20 },
  { id: 57, text: "من هو هداف بطولة كأس العالم 2022 التي أقيمت في قطر؟", options: ["ليونيل ميسي", "إيرلينغ هالاند", "كيليان مبابي", "أوليفيه جيرو"], correct: 2, minLevel: 20 },
  { id: 58, text: "أي منتخب فاز بلقب كأس أمم أفريقيا ثلاث مرات متتالية (2006, 2008, 2010)؟", options: ["الكاميرون", "غانا", "مصر", "نيجيريا"], correct: 2, minLevel: 20 },
  { id: 59, text: "ما هو الملعب الشهير الذي يعتبر المعقل الأساسي لمنتخب إنجلترا؟", options: ["أولد ترافورد", "أنفيلد", "ويمبلي", "ستامفورد بريدج"], correct: 2, minLevel: 20 },
  { id: 60, text: "من هو اللاعب الفرنسي الأسطوري الفائز بالكرة الذهبية 1998 ورئيس اليويفا السابق؟", options: ["زين الدين زيدان", "ميشيل بلاتيني", "تييري هنري", "ريمون كوبا"], correct: 1, minLevel: 20 },
  { id: 61, text: "من هو الحارس الأسطوري لمنتخب إسبانيا وريال مدريد والملقب بـ 'القديس'؟", options: ["إيكر كاسياس", "فيكتور فالديز", "دافيد دي خيا", "سانتياغو كانيزاريس"], correct: 0, minLevel: 20 },
  { id: 62, text: "أي لاعب فاز بلقب هداف دوري أبطال أوروبا في موسم 2022-2023؟", options: ["كريم بنزيما", "إيرلينغ هالاند", "فينيسيوس جونيور", "محمد صلاح"], correct: 1, minLevel: 20 },
  { id: 63, text: "كم عدد الفرق المشاركة في دور المجموعات لدوري أبطال أوروبا بالنظام القديم المعتاد؟", options: ["24", "32", "36", "40"], correct: 1, minLevel: 20 },
  { id: 64, text: "من هو صاحب أسرع هدف في تاريخ بطولات كأس العالم (بعد 11 ثانية فقط)؟", options: ["هاكان شوكور", "بريان روبسون", "بيليه", "كلينت ديمبسي"], correct: 0, minLevel: 20 },
  { id: 65, text: "ما هو النادي الذي فاز بأول بطولة دوري أبطال أوروبا في تاريخه عام 2023؟", options: ["باريس سان جيرمان", "أتلتيكو مدريد", "مانشستر سيتي", "نيوكاسل"], correct: 2, minLevel: 20 },
  { id: 66, text: "من هو اللاعب الذي سجل أكبر عدد من الأهداف في مباراة واحدة في تاريخ البريميرليغ (5 أهداف) وتكرر من عدة لاعبين ولكن من هو الأول؟", options: ["أندي كول", "ألان شيرر", "سيرجيو أغويرو", "ديميتار برباتوف"], correct: 0, minLevel: 20 },
  { id: 67, text: "أي نادٍ هولندي حقق لقب دوري أبطال أوروبا 4 مرات في تاريخه؟", options: ["بي إس في آيندهوفن", "فاينورد", "أياكس أمستردام", "ألكمار"], correct: 2, minLevel: 20 },
  { id: 68, text: "من هو هداف منتخب الأرجنتين التاريخي في بطولات كأس العالم لكرة القدم؟", options: ["غابرييل باتيستوتا", "دييغو مارادونا", "ليونيل ميسي", "هرنان كرسبو"], correct: 2, minLevel: 20 },
  { id: 69, text: "أي منتخب أوروبي يلقب بـ 'الشياطين الحمر' ويضم جيل دي بروين ولوكاكو؟", options: ["البرتغال", "بلجيكا", "سويسرا", "الدنمارك"], correct: 1, minLevel: 20 },
  { id: 70, text: "ما هو النادي الأوروبي الوحيد الذي حقق الثلاثية التاريخية مرتين؟", options: ["ريال مدريد", "بايرن ميونخ", "برشلونة", "مانشستر سيتي"], correct: 2, minLevel: 20 },

  // ==================== مستوى خبراء التكتيك (من 71 إلى 105) ====================
  { id: 71, text: "ما هو المنتخب الأفريقي الوحيد الذي وصل إلى نصف نهائي كأس العالم؟", options: ["الكاميرون", "السنغال", "غانا", "المغرب"], correct: 3, minLevel: 45 },
  { id: 72, text: "من هو النجم الفائز بالكرة الذهبية لعام 2007 قبل هيمنة ميسي ورونالدو؟", options: ["كاكا", "رونالدينيو", "تييري هنري", "أندري شيفتشينكو"], correct: 0, minLevel: 45 },
  { id: 73, text: "أي لاعب يحمل لقب الهداف التاريخي لمنتخب البرازيل في المباريات الرسمية؟", options: ["بيليه", "رونالدو نازاريو", "نيمار داسيلفا", "روماريو"], correct: 2, minLevel: 45 },
  { id: 74, text: "من هو أكثر لاعب تحقيقاً للألقاب والبطولات الجماعية في تاريخ كرة القدم؟", options: ["ليونيل ميسي", "داني ألفيس", "كريستيانو رونالدو", "أندريس إنييستا"], correct: 0, minLevel: 45 },
  { id: 75, text: "في أي عام حقق المنتخب الدنماركي معجزته وفاز بكأس أمم أوروبا بعد استدعائه من الإجازة؟", options: ["1988", "1992", "1996", "2000"], correct: 1, minLevel: 45 },
  { id: 76, text: "من هو إلى المدرب الإيطالي الأسطوري الوحيد الذي فاز بلقب الدوري في 4 دول أوروبية مختلفة؟", options: ["فابيو كابيلو", "كارلو أنشيلوتي", "مارتشيلو ليبي", "أنطونيو كونتي"], correct: 1, minLevel: 45 },
  { id: 77, text: "كم عدد الأهداف الإجمالية التي سجلها الأسطورة بيليه في مسيرته بحسب توثيق الفيفا الرسمي؟", options: ["1281", "757", "830", "650"], correct: 1, minLevel: 45 },
  { id: 78, text: "أي لاعب فاز بجائزة هداف كأس العالم 2002 برصيد 8 أهداف؟", options: ["ميروسلاف كلوزه", "رونالدو نازاريو", "ريفالدو", "تييري هنري"], correct: 1, minLevel: 45 },
  { id: 79, text: "من هو هداف الدوري الإيطالي التاريخي (السيري آ)؟", options: ["فرانشيسكو توتي", "سيلفيو بيولا", "جوزيبي مياتزا", "أنتونيو دي ناتالي"], correct: 1, minLevel: 45 },
  { id: 80, text: "ما هو النادي الذي لعب له الأسطورة دييغو مارادونا في إسبانيا غير برشلونة؟", options: ["إشبيلية", "فالنسيا", "أتلتيكو مدريد", "ريال سيرقسطة"], correct: 0, minLevel: 45 },
  { id: 81, text: "أي نادٍ أوروبي تأسس في عام 1899 على يد السويسري خوان غامبر؟", options: ["ريال مدريد", "برشلونة", "بايرن ميونخ", "يوفنتوس"], correct: 1, minLevel: 45 },
  { id: 82, text: "من هو اللاعب الذي سجل هدف الفوز لمنتخب إسبانيا في نهائي كأس العالم 2010؟", options: ["تشافي هيرنانديز", "أندريس إنييستا", "ديفيد فيا", "فرناندو توريس"], correct: 1, minLevel: 45 },
  { id: 83, text: "أي منتخب فاز بأول نسخة من بطولة دوري الأمم الأوروبية عام 2019؟", options: ["فرنسا", "البرتغال", "هولندا", "إسبانيا"], correct: 1, minLevel: 45 },
  { id: 84, text: "من هو الهداف التاريخي لمنتخب فرنسا لكرة القدم حالياً؟", options: ["تييري هنري", "أوليفيه جيرو", "كيليان مبابي", "زين الدين زيدان"], correct: 1, minLevel: 45 },
  { id: 85, text: "ما هو النادي الإنجليزي القديم والعريق الذي حقق دوري أبطال أوروبا مرتين متتاليتين عامي 1979 و 1980؟", options: ["أستون فيلا", "نوتينغهام فورست", "ليدز يونايتد", "توتنهام"], correct: 1, minLevel: 45 },
  { id: 86, text: "من هو اللاعب الوحيد الذي حقق لقب دوري أبطال أوروبا مع 3 أندية مختلفة (أياكس، ريال مدريد، وميلان)؟", options: ["كلارنس سيدورف", "كريستيانو رونالدو", "صامويل إيتو", "زلاتان إبراهيموفيتش"], correct: 0, minLevel: 45 },
  { id: 87, text: "أي حارس مرمى يحمل الرقم القياسي لأطول فترة نظافة شباك في تاريخ كأس العالم؟", options: ["والتر زينجا", "جانلويجي بوفون", "إيكر كاسياس", "أوليفر كان"], correct: 0, minLevel: 45 },
  { id: 88, text: "من هو المدرب البرتغالي الشهير الذي أطلق على نفسه لقب 'The Special One'؟", options: ["جورجي جيسوس", "جوزيه مورينيو", "فرناندو سانتوس", "روبن أموريم"], correct: 1, minLevel: 45 },
  { id: 89, text: "أي نادٍ ألماني كسر هيمنة بايرن ميونخ وحقق دوري لا هزيمة الأسطوري 2024؟", options: ["بوروسيا دورتموند", "لايبزيغ", "باير ليفركوزن", "شتوتغارت"], correct: 2, minLevel: 45 },
  { id: 90, text: "من هو اللاعب الذي فاز بجائزة الكرة الذهبية لعام 2018 بعد قيادة كرواتيا لنهائي المونديال؟", options: ["لوكا مودريتش", "إيفان راكيتيتش", "كريستيانو رونالدو", "أنطوان غريزمان"], correct: 0, minLevel: 45 },
  { id: 91, text: "أي لاعب سجل أسرع هاتريك في تاريخ الدوري الإنجليزي الممتاز (خلال دقيقتين و56 ثانية)؟", options: ["ساديو ماني", "روبي فاولر", "رحيم ستيرلينغ", "سون هيونغ مين"], correct: 0, minLevel: 45 },
  { id: 92, text: "كم عدد الكرات الذهبية (Ballon d'Or) التي حققها الأسطورة ليونيل ميسي؟", options: ["6", "7", "8", "9"], correct: 2, minLevel: 45 },
  { id: 93, text: "من هو اللاعب الذي يملك أكبر عدد من التمريرات الحاسمة (Assists) في تاريخ البريميرليغ؟", options: ["سيسك فابريغاس", "واين روني", "ريان غيغز", "كيفين دي بروين"], correct: 2, minLevel: 45 },
  { id: 94, text: "ما هي الدولة الأفريقية التي نظمت بطولة كأس العالم لكرة القدم لأول مرة في القارة؟", options: ["مصر", "المغرب", "جنوب أفريقيا", "نيجيريا"], correct: 2, minLevel: 45 },
  { id: 95, text: "من هو اللاعب التونسي الأسطوري الذي سجل أول هدف للعرب في تاريخ كأس العالم 1978؟", options: ["طارق ذياب", "علي الكعبي", "تميم الحزامي", "فيصل الدخيل"], correct: 1, minLevel: 45 },
  { id: 96, text: "أي نادٍ أوروبي عريق يلقب بـ 'الخفافيش' ويلعب في ملعب الميستايا？", options: ["إشبيلية", "فالنسيا", "فاريال", "بيلباو"], correct: 1, minLevel: 45 },
  { id: 97, text: "من هو اللاعب الملقب بـ 'موزارت الصغير' ولعب لأرسنال وبروسيا دورتموند؟", options: ["توماس روزيسكي", "سيسك فابريغاس", "ماريو غوتزه", "ماركو رويس"], correct: 0, minLevel: 45 },
  { id: 98, text: "ما هو النادي البرازيلي الذي انطلقت منه موهبة الأسطورة نيمار داسيلفا؟", options: ["فلامنغو", "بالميراس", "سانتوس", "ساو باولو"], correct: 2, minLevel: 45 },
  { id: 100, text: "أي منتخب فاز بلقب كأس العالم لكرة القدم عام 1998 التي أقيمت على أرضه؟", options: ["البرازيل", "إيطاليا", "فرنسا", "كرواتيا"], correct: 2, minLevel: 45 },
  { id: 101, text: "من هو هداف منتخب إنجلترا التاريخي في كل المسابقات؟", options: ["واين روني", "بوبي تشارلتون", "هاري كين", "ألان شيرر"], correct: 2, minLevel: 45 },
  { id: 102, text: "أي لاعب يلقب بـ 'المهندس' واشتهر بكراته الثابتة الساحرة مع ميلان ويوفنتوس؟", options: ["أندريا بيرلو", "فرانشيسكو توتي", "أليساندرو ديل بييرو", "كاكا"], correct: 0, minLevel: 45 },
  { id: 103, text: "كم عدد ألقاب نادي ريال مدريد في بطولة دوري أبطال أوروبا (حتى عام 2024)؟", options: ["13", "14", "15", "16"], correct: 2, minLevel: 45 },
  { id: 104, text: "من هو اللاعب الآسيوي الأعلى تقييماً ويسجل أرقاماً قياسية مع توتنهام في البريميرليغ؟", options: ["بارك جي سونغ", "سون هيونغ مين", "ميناميانو", "كاغاوا"], correct: 1, minLevel: 45 },
  { id: 105, text: "ما هو النادي الذي يطلق عليه لقب 'الفيرديبيلانكوس' ويعتبر غريماً تقليدياً لإشبيلية؟", options: ["ريال بيتيس", "فالنسيا", "مالقا", "غرناطة"], correct: 0, minLevel: 45 }
];

// ==========================================================
// 3. محرك اللعبة الأساسي والتكتيكات الفورية
// ==========================================================
let currentQuestionIndex = 0;
let score = 0;
let hearts = 5;
let correctAnswersCount = 0;
let totalAnsweredCount = 0;

const heartsContainer = document.getElementById("heartsContainer");
const scoreValue = document.getElementById("scoreValue");
const correctCount = document.getElementById("correctCount");
const answeredCount = document.getElementById("answeredCount");
const difficultyTag = document.getElementById("difficultyTag");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedbackMsg = document.getElementById("feedbackMsg");
const nextBtn = document.getElementById("nextBtn");
const quizCard = document.getElementById("quizCard");
const gameOverScreen = document.getElementById("gameOverScreen");
const prizeScreen = document.getElementById("prizeScreen");
const lostAnsweredCount = document.getElementById("lostAnsweredCount");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const menuDropdown = document.getElementById("menuDropdown");

function initGame() {
  currentQuestionIndex = 0;
  score = 0;
  hearts = 5;
  correctAnswersCount = 0;
  totalAnsweredCount = 0;
  
  if (quizCard) quizCard.classList.remove("hidden");
  if (gameOverScreen) gameOverScreen.classList.add("hidden");
  if (prizeScreen) prizeScreen.classList.add("hidden");
  
  updateStatsUI();
  loadQuestion();
}

function updateStatsUI() {
  if (scoreValue) scoreValue.innerText = score;
  if (correctCount) correctCount.innerText = correctAnswersCount;
  if (answeredCount) answeredCount.innerText = totalAnsweredCount;
  
  if (heartsContainer) {
    heartsContainer.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const heartSpan = document.createElement("span");
      heartSpan.className = "heart";
      heartSpan.innerText = i < hearts ? "❤️" : "🖤";
      heartsContainer.appendChild(heartSpan);
    }
  }

  if (difficultyTag) {
    if (correctAnswersCount >= 45) {
      difficultyTag.innerText = "🔥 مستوى خبراء التكتيك";
      difficultyTag.style.background = "#4d1414";
    } else if (correctAnswersCount >= 20) {
      difficultyTag.innerText = "⚡ المستوى المتوسط التكتيكي";
      difficultyTag.style.background = "#b38600";
    } else {
      difficultyTag.innerText = "📘 مستوى المبتدئين";
      difficultyTag.style.background = "#1a3a5c";
    }
  }
}

function loadQuestion() {
  if (feedbackMsg) feedbackMsg.innerText = "✨ اختر الإجابة الصحيحة لتبدأ التحدي";
  if (nextBtn) nextBtn.classList.add("hidden");

  if (correctAnswersCount >= 50) {
    showWinningScreen();
    return;
  }

  let availableQuestions = questionsDatabase.filter(q => correctAnswersCount >= q.minLevel);
  if (availableQuestions.length === 0) availableQuestions = questionsDatabase;

  const currentQuestion = availableQuestions[currentQuestionIndex % availableQuestions.length];

  if (questionText) questionText.innerText = currentQuestion.text;
  if (optionsContainer) {
    optionsContainer.innerHTML = "";
    currentQuestion.options.forEach((option, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerText = option;
      btn.onclick = function() { checkAnswer(idx, currentQuestion.correct, btn); };
      optionsContainer.appendChild(btn);
    });
  }
}

function checkAnswer(selectedIdx, correctIdx, clickedBtn) {
  const allButtons = optionsContainer.querySelectorAll(".option-btn");
  allButtons.forEach(btn => btn.disabled = true);

  if (selectedIdx === correctIdx) {
    clickedBtn.style.background = "#238636";
    clickedBtn.style.borderColor = "#2ea043";
    if (feedbackMsg) feedbackMsg.innerText = "🔥 إجابة أسطورية صحيحة! +10 نقاط";
    score += 10;
    correctAnswersCount++;
  } else {
    clickedBtn.style.background = "#da3637";
    clickedBtn.style.borderColor = "#f85149";
    allButtons[correctIdx].style.background = "#238636";
    if (feedbackMsg) feedbackMsg.innerText = "💔 تكتيك خاطئ! فقدت قلباً.";
    hearts--;
  }

  totalAnsweredCount++;
  updateStatsUI();

  if (hearts <= 0) setTimeout(showGameOverScreen, 1200);
  else { currentQuestionIndex++; if (nextBtn) nextBtn.classList.remove("hidden"); }
}

function showGameOverScreen() {
  if (quizCard) quizCard.classList.add("hidden");
  if (gameOverScreen) { gameOverScreen.classList.remove("hidden"); if (lostAnsweredCount) lostAnsweredCount.innerText = correctAnswersCount; }
  saveUserScore(score);
}

function showWinningScreen() {
  if (quizCard) quizCard.classList.add("hidden");
  if (prizeScreen) prizeScreen.classList.remove("hidden");
  saveUserScore(score);
}

if (nextBtn) { nextBtn.onclick = function() { loadQuestion(); }; }
if (hamburgerBtn && menuDropdown) {
  hamburgerBtn.onclick = function(e) { e.stopPropagation(); menuDropdown.classList.toggle("hidden"); };
  document.addEventListener("click", function(e) { if (!hamburgerBtn.contains(e.target) && !menuDropdown.contains(e.target)) menuDropdown.classList.add("hidden"); });
}
if (document.getElementById("menuReset")) document.getElementById("menuReset").onclick = function(e) { e.preventDefault(); initGame(); menuDropdown.classList.add("hidden"); };
if (document.getElementById("menuInfo")) document.getElementById("menuInfo").onclick = function(e) { e.preventDefault(); alert("🏆 كأس المعرفة:\n• لديك 5 قلوب فقط للخطأ.\n• تخطى 50 سؤال لتربح الجائزة الأسطورية للـ Z3Z3 Tactics!"); menuDropdown.classList.add("hidden"); };

if (document.getElementById("restartGameBtn1")) document.getElementById("restartGameBtn1").onclick = function() { initGame(); };
if (document.getElementById("restartGameBtn2")) document.getElementById("restartGameBtn2").onclick = function() { initGame(); };

// ==========================================================
// 4. نظام الحفظ السحابي التلقائي للمتصدرين
// ==========================================================
async function saveUserScore(finalScore) {
  if (!currentUser || !supabaseClient) return;
  try {
    const { error } = await supabaseClient.from('leaderboard').upsert({
      id: currentUser.id,
      username: currentUser.user_metadata?.full_name || currentUser.email,
      high_score: finalScore,
      updated_at: new Date()
    });
    if (!error) fetchLeaderboard();
  } catch (e) { console.log(e); }
}

async function loadUserProgress() {
  if (!currentUser || !supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('leaderboard').select('high_score').eq('id', currentUser.id).single();
    if (data && !error) {
      score = data.high_score;
      if (scoreValue) scoreValue.innerText = score;
    }
  } catch (e) { console.log(e); }
}

async function fetchLeaderboard() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('leaderboard').select('username, high_score').order('high_score', { ascending: false }).limit(5);
    if (data && !error) {
      renderLeaderboard(data);
    }
  } catch (e) { console.log(e); }
}

function renderLeaderboard(players) {
  const leaderboardList = document.getElementById("leaderboardList");
  if (!leaderboardList) return;
  if (players.length > 0) {
    leaderboardList.innerHTML = players.map((player, index) => {
      let medal = index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : "🏅 ";
      return `<li style="padding: 6px 0; border-bottom: 1px solid #111; color: #ccc; display: flex; justify-content: space-between;">
                <span>${medal}${player.username.split(' ')[0]}</span>
                <span style="color: #d4af37; font-weight: bold;">${player.high_score}</span>
              </li>`;
    }).join("");
  } else {
    leaderboardList.innerHTML = `<li style="text-align: center; color: #555;">كن أول من يتصدر اللوحة! 🔥</li>`;
  }
}