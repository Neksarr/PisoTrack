
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification,signOut,updateProfile} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBv2m_ciaohvHg7xCqkSWeTM_TfiphzMqw",
  authDomain: "pisotrack-e61d6.firebaseapp.com",
  projectId: "pisotrack-e61d6",
  storageBucket: "pisotrack-e61d6.firebasestorage.app",
  messagingSenderId: "492013865042",
  appId: "1:492013865042:web:e0ccf6e2bee76aab32f78b"
};

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);const lm=loginMessage,sm=signupMessage,modal=signupModal;
passwordToggle.onclick=()=>{const showing=password.type==="text";password.type=showing?"password":"text";passwordToggle.querySelector("img").src=showing?"eyeofficon.png":"eyeshowicon.png";passwordToggle.setAttribute("aria-label",showing?"Show password":"Hide password")};
function setupPasswordToggle(input,toggle,label="password"){toggle.onclick=()=>{const showing=input.type==="text";input.type=showing?"password":"text";toggle.querySelector("img").src=showing?"eyeofficon.png":"eyeshowicon.png";toggle.setAttribute("aria-label",showing?`Show ${label}`:`Hide ${label}`)}}
setupPasswordToggle(signupPassword,signupPasswordToggle);setupPasswordToggle(signupConfirm,signupConfirmToggle,"confirmed password");
function show(el,t,type="error"){el.textContent=t;el.className="message show "+type}
function friendly(error){console.error(error);const code=error?.code||"";if(code.includes("invalid-credential"))return"Incorrect email or password.";if(code.includes("email-already-in-use"))return"That email is already registered.";if(code.includes("invalid-email"))return"Enter a valid email.";if(code.includes("weak-password"))return"Password is too weak.";if(code.includes("too-many-requests"))return"Too many attempts. Please wait and try again.";if(code.includes("network-request-failed"))return"Unable to connect. Check your internet connection and try again.";return"Unable to complete the request. Please try again."}
function safeEmailKey(email){return String(email||"guest").replaceAll("@","_at_").replaceAll(".","_dot_").replaceAll("+","_plus_")}
async function initializeVerifiedUser(user){
  await setDoc(doc(db,"users",user.uid),{uid:user.uid,name:user.displayName||"User",email:user.email},{merge:true});
  const appDataRef=doc(db,"users",user.uid,"appData","default"),snapshot=await getDoc(appDataRef),existingData=snapshot.exists()?snapshot.data():{},transactionField="transactions_"+safeEmailKey(user.email);
  const initialData={currentEmail:user.email,email:user.email,updatedAt:Date.now()};
  if(!Object.prototype.hasOwnProperty.call(existingData,"currency"))initialData.currency="PHP";
  if(!Object.prototype.hasOwnProperty.call(existingData,"dark"))initialData.dark=false;
  if(!Object.prototype.hasOwnProperty.call(existingData,transactionField))initialData[transactionField]="[]";
  await setDoc(appDataRef,initialData,{merge:true});
}
let unverifiedCredentials=null;
loginBtn.onclick=async()=>{resendVerification.classList.remove("show");try{const em=email.value.trim(),pw=password.value;const result=await signInWithEmailAndPassword(auth,em,pw);if(!result.user.emailVerified){unverifiedCredentials={email:em,password:pw};await signOut(auth);show(lm,"Please verify your email first before logging in.");resendVerification.classList.add("show");return}await initializeVerifiedUser(result.user);location.href="index.html"}catch(e){const code=e.code||"";if(code.includes("invalid-credential")||code.includes("user-not-found")){console.error(e);show(lm,"We couldn't find a matching account. If you haven't registered yet, click Sign Up below to create an account.","success")}else show(lm,friendly(e))}};
resendVerification.onclick=async()=>{if(!unverifiedCredentials)return show(lm,"Enter your email and password, then log in again.");resendVerification.disabled=true;try{const result=await signInWithEmailAndPassword(auth,unverifiedCredentials.email,unverifiedCredentials.password);await sendEmailVerification(result.user,{url:new URL("login.html",location.href).href});await signOut(auth);show(lm,"A new verification email has been sent.","success")}catch(e){show(lm,friendly(e))}finally{resendVerification.disabled=false}};
forgot.onclick=async e=>{e.preventDefault();if(!email.value.trim())return show(lm,"Enter your email first.");try{await sendPasswordResetEmail(auth,email.value.trim(),{url:new URL("login.html",location.href).href});show(lm,"Password reset email sent.","success")}catch(err){show(lm,friendly(err))}};
openSignup.onclick=()=>modal.classList.add("open");cancelSignup.onclick=()=>modal.classList.remove("open");
signupBtn.onclick=async()=>{const n=signupName.value.trim(),em=signupEmail.value.trim(),pw=signupPassword.value,cp=signupConfirm.value;if(!n||!em||!pw||!cp)return show(sm,"Complete all fields.");if(pw.length<8)return show(sm,"Password must be at least 8 characters.");if(pw!==cp)return show(sm,"Passwords do not match.");signupBtn.disabled=true;try{const result=await createUserWithEmailAndPassword(auth,em,pw);await updateProfile(result.user,{displayName:n});await sendEmailVerification(result.user,{url:new URL("login.html",location.href).href});await signOut(auth);show(sm,"Account created successfully. Please check your email and verify your account before logging in.","success");signupName.value="";signupEmail.value="";signupPassword.value="";signupConfirm.value=""}catch(e){if(auth.currentUser){try{await signOut(auth)}catch(signOutError){console.error(signOutError)}}show(sm,friendly(e))}finally{signupBtn.disabled=false}};
googleBtn.onclick=()=>show(lm,"Google login is not connected yet.");appleBtn.onclick=()=>show(lm,"Apple login is not connected yet.");
