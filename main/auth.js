import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail  } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, getDocs, query, where, QuerySnapshot } from "firebase/firestore"
import {firebaseConfig} from "./firebaseConfig"

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)
const usersCollection = collection(db, "users")
const sportCollection = collection(db, "sport")
const gameCollection = collection(db, "game")
const otherCollection = collection(db, "other")

const textInput = document.getElementById('textInput');
const textForm = document.getElementById('textForm')
const posts = document.getElementById('posts')

const divRegistration = document.getElementById('registration')
const divInf = document.getElementById('inf')

const createUser = document.getElementById('reg')
const signUser = document.getElementById('sign')
const passwordResetForm = document.getElementById('passwordReset');
const signOutButton = document.getElementById('signOutButton');
const btnSign = document.getElementById('btnSign')
const btnProfile = document.getElementById('btnProfile')

passwordResetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const emailAddress = passwordResetForm.email.value;

  sendPasswordResetEmail(auth, emailAddress)
    .then(() => {
      const resetInfo = document.getElementById('reset-info');
      const dialog = document.getElementById('myDialog')
      if (resetInfo) {
        resetInfo.textContent = 'Письмо отправлено на электронную почту!'
      }
      let timeoutSet = false
      if (dialog){
         if (!timeoutSet){
          timeoutSet = true
          setTimeout(function(){
            dialog.style.display = 'none'
            document.body.classList.remove('blocking')
            window.location.reload()
          }, 5000)
         }
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const resetInfo = document.getElementById('reset-info');
      
      if (errorCode === 'auth/invalid-email') {
        resetInfo.textContent = 'Неверный формат email';
      } 
      else if (errorCode === 'auth/user-not-found') {
        resetInfo.textContent = 'Пользователь не найден';
      }
    });
});

createUser.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const nickname = document.getElementById('nicknameInput').value;


  const passwordCheck = document.getElementById('password')
  const emailCheck = document.getElementById('email')
  const passwordRegCheck = document.createElement('p')
  const nicknameCheck = document.createElement('p')
  const emailRegCheck = document.createElement('p')

  removeElementIfExists('.passwordReg-Check')
  removeElementIfExists('.emailReg-Check')

  if (!validatePassword(password)){
    passwordRegCheck.classList.add('passwordReg-Check')
    passwordRegCheck.textContent = 'Введите от 6 до 20 символов'
    passwordCheck.after(passwordRegCheck);
  }

  try {
    const nicknameExists = await checkNicknameExists(nickname);

    removeElementIfExists('.nickname-Check')

    if (nicknameExists) {
      const btnSubmit = document.getElementById('reg-btn')
      nicknameCheck.classList.add('nickname-Check')
      nicknameCheck.textContent = 'Такой ник уже существует'
      createUser.insertBefore(nicknameCheck, btnSubmit)

      if (!document.querySelector('.nickname-Check')) {
        createUser.insertBefore(nicknameCheck, btnSubmit);
      }
      return;
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), { nickname });
    document.getElementById("sidebar").classList.add("open");
    window.scrollTo(
      { top: 0, 
        left: 0, 
        behavior: "smooth" 
      }
    );
  } catch (error) {
    const errorCode = error.code
      if(errorCode === 'auth/email-already-in-use'){
        emailRegCheck.textContent = 'Email уже используется'
        emailRegCheck.classList.add('emailReg-Check')
        emailCheck.after(emailRegCheck)
      }
  }
});

function validatePassword(password) {
  return password.length >= 6 && password.length <= 20;
}

function removeElementIfExists(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.remove();
  }
}

async function checkNicknameExists(nickname) {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("nickname", "==", nickname)));
    return !querySnapshot.empty;
  } catch (error) {
    throw error;
  }
}

signUser.addEventListener('submit', function(event){
  event.preventDefault()
  const email = sign.email.value
  const password = sign.password.value

  const emailCheck = document.getElementById('rebut')
  const emailSignCheck = document.createElement('p')

  removeElementIfExists('.emailSign-Check')

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential)=>{
    const user = userCredential.user
    document.getElementById("sidebar").classList.add("open");
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  })
  .catch((error) => {
    const errorCode = error.code
    const errorMessage = error.message

    if (errorCode === 'auth/invalid-email') {
      emailSignCheck.textContent = 'Неверный формат email';
    } 
    else if(errorCode === 'auth/invalid-credential'){
      emailSignCheck.textContent = 'Неверный email или пароль'
    }
    else {
      emailSignCheck.textContent = 'Ошибка входа: ' + errorMessage;
    }

    emailSignCheck.classList.add('emailSign-Check')
    emailCheck.after(emailSignCheck)
    console.error(error)
  });
})

signOutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      document.getElementById('sidebar').classList.remove('open')
      const blockInf = document.getElementById('inf')
      blockInf.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "center",
      })
    }).catch((error) => {

    });
});

async function loadNickname() {
  const user = auth.currentUser;
  if (user) {
      try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
              const nickname = userDoc.data().nickname;
              const nicknameDisplay = document.getElementById('nickname');
              if (nicknameDisplay) {
                  nicknameDisplay.textContent = `${nickname}`;
              }
          } else {
              console.error("User data not found in Firestore.");
          }
      } catch (error) {
          console.error("Error fetching nickname:", error);
      }
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
      btnSign.style.display = 'none'
      btnProfile.style.display = 'block'
      let flag = false
      if (!flag){
        flag = true
        setTimeout(function(){
          divRegistration.style.display = 'none'
          divInf.style.display = 'none'
          posts.style.display = 'block'
        },1000)
      }
      loadSharedText();
      loadNickname()
  } else {
      btnSign.style.display = 'block'
      btnProfile.style.display = 'none'
      divRegistration.style.display = 'grid'
      divInf.style.display = 'block'
      posts.style.display = 'none'
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const btnTems = document.querySelectorAll('.btnTem');
  const texts = document.querySelectorAll('.text');

  btnTems.forEach(btnTem => {
    btnTem.addEventListener('click', function() {

      btnTems.forEach(btn => btn.classList.remove('active'));
      btnTem.classList.add('active');

      texts.forEach(text => {
        text.style.display = 'none';
      });

      const targetId = btnTem.dataset.target;
      const targetBlock = document.getElementById(targetId);
      if (targetBlock) {
        targetBlock.style.display = 'grid';
      }
    });
  });
});

const temsDialog = document.getElementById("temsDialog");
temsDialog.addEventListener('click', (event) => {
    if (event.target.classList.contains('btnTem')) {
        const selectedTheme = event.target.dataset.theme;
        document.getElementById("selectedTheme").value = selectedTheme;
    }
});

textForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const saveTextBtn = document.getElementById('saveTextButton')
    const temsDialog = document.getElementById('temsDialog')
    const error = document.createElement('strong')
    const user = auth.currentUser;

    removeElementIfExists('.error')
    
    if (!user) {
        alert("Вы должны войти в систему, чтобы сохранить текст.");
        return;
    }

    const selectedTheme = document.getElementById("selectedTheme").value;
    if (selectedTheme === "") {
        error.classList.add('error')
        error.textContent = 'Выберите тему'
        temsDialog.appendChild(error)
        return;
    }

    const text = textInput.value.trim();
    if (text === "") {
        error.classList.add('error')
        error.textContent = 'Текст не должен быть пустым'
        saveTextBtn.before(error)
        return;
    }

    try {
        const user = auth.currentUser;
        const uid = user.uid;
        let collectionRef;

        switch (selectedTheme) {
            case 'sport':
                collectionRef = sportCollection;
                break;
            case 'game':
                collectionRef = gameCollection;
                break;
            case 'other':
                collectionRef = otherCollection;
                break;
            default:
                throw new Error("Неизвестная тема");
        }

        await addDoc(collectionRef, { text, uid, theme: selectedTheme });
        alert("Текст успешно сохранен!");
        textInput.value = "";
        loadedThemes.delete(selectedTheme);
        loadSharedText(selectedTheme);
    } catch (error) {
        console.error("Ошибка сохранения текста:", error);
        alert("Ошибка сохранения текста. Попробуйте позже.");
    }
});

let loadPromise = Promise.resolve();

const tems = document.getElementById("tems");
tems.addEventListener('click', (event) => {
  if (event.target.classList.contains('btnTem')) {
    const target = event.target.dataset.target;
    const selectedTheme = target === 'textSport' ? 'sport' : (target === 'textGame' ? 'game' : 'other');
    loadPromise = loadPromise.then(() => loadSharedText(selectedTheme));
  }
});

const loadedThemes = new Set();

const loadSharedText = (selectedTheme) => {
    return new Promise(async (resolve, reject) => {
        try {
          if (!selectedTheme) {
            return resolve();
        }

        if (loadedThemes.has(selectedTheme)) {
            return resolve();
        }
            const collectionRef = collection(db, selectedTheme);
            const q = query(collectionRef, where("text", "!=", ""));
            const querySnapshot = await getDocs(q);
            const targetDiv = document.getElementById(selectedTheme === 'sport' ? 'textSport' : (selectedTheme === 'game' ? 'textGame' : 'textOther'));
            targetDiv.innerHTML = '';
            querySnapshot.forEach(async (doc) => {
                const divContent = document.createElement('div');
                const pNicknameContent = document.createElement('p');
                const pTextContent = document.createElement('p');

                const articleData = doc.data();
                const uid = articleData.uid;
                const nickname = await getNickname(uid);

                pNicknameContent.textContent = `${nickname}`;
                pTextContent.textContent = `${articleData.text}`;

                pNicknameContent.classList.add('pTextContent');
                divContent.classList.add('textarea-mimic');
                divContent.prepend(pNicknameContent);
                divContent.appendChild(pTextContent);
                targetDiv.prepend(divContent);
            });
            loadedThemes.add(selectedTheme);
            resolve();
        } catch (error) {
            const targetDiv = document.getElementById(selectedTheme === 'sport' ? 'textSport' : (selectedTheme === 'game' ? 'textGame' : 'textOther'));
            targetDiv.textContent = "Ошибка загрузки текста.";
            reject(error);
        }
    });
};

async function getNickname(uid) {
  if (!uid) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().nickname : null;
  } catch (error) {
    console.error("Ошибка получения никнейма:", error);
    return null;
  }
}
