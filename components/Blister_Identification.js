import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { COLORS, FONTS, SIZES, icons, images } from "../constants";
import Cultivar from "./Cultivar";
import ImageViewer from "./ImageViewer";
import { Camera, CameraType } from "expo-camera";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import AppLoader from "./AppLoader";
import { firebase } from '../global/firebase';
import * as Notifications from 'expo-notifications';
import ip_address from '../global/Config'
import * as Location from 'expo-location';
import * as geolib from 'geolib';

const PlaceholderImage = require("../assets/upload-image.png");
const { height, width } = Dimensions.get("window");

const Blister_Identification = ({ navigation }) => {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [image, setImage] = useState(null);

  const [cultivarData, setCultivarData] = useState(null);
  const [cultivar, setCultivar] = useState(null);

  const [blisterData, setBlisterData] = useState(null);
  const [blister, setBlister] = useState(null);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [imageCapture, setImageCapture] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);

  const [isShow, setIsShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [geoData, setGeoData] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [date, setDate] = useState(null);
//////////////////////////////////////////////////
  const [users, setUsers] = useState([]);
  const todoRef = firebase.firestore().collection('Users');

  //get user details from the firestore
  useEffect(() => {
    const unsubscribe = todoRef.onSnapshot((querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        const { geo,push_token} = doc.data();
        users.push({
          geo,
          push_token,
        });
      });
      setUsers(users);
    });

    return () => {
      unsubscribe();
    };
  }, []);

////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");

      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const pickImage = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        name: "test.jpg",
        type: "image/jpeg",
      });
      axios
        .post(ip_address+'/getCultivar', formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async (response) => {
          setImage(result.assets[0].uri);
          console.log("Response ---- ", response.data);
          setCultivarData(response.data);
          setCultivar(response.data.Cultivar[0]);

          console.log("Cultivar -> ", response.data.Cultivar[0]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
      setIsLoading(true);

      axios
        .post(ip_address+"/getBlister", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async (response2) => {
          setImage(result.assets[0].uri);
          console.log("Response ---- ", response2.data);
          setBlisterData(response2.data);
          setBlister(response2.data.Blister[0]);

          console.log("Blister -> ", response2.data.Blister[0]);
          setIsLoading(false);

        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
        /////////////////////////////////////////////////////////////
        axios.post(ip_address+"/geo", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(async (response3) => {

          setImage(result.assets[0].uri);
          // console.log("Response ",response);
          setGeoData(response3.data);
          setLatitude(response3.data.lat[0]);
          setLongitude(response3.data.lon[0]);
          setDate(response3.data.date[0]);

          //////////////////////////////////////////////////////////////////////////

          if (blister == 'Identified'){

            //filter out the users who're in the within area of the blister identified location
            const identifiedLocation = { latitude: latitude, longitude: longitude };

            const filteredLocations = users.filter((item) => {
              const distance = geolib.getDistance(identifiedLocation, item.geo);
              return distance <= 5000;
            });
            //filter out the user's push tokens
          const push_tokens = filteredLocations.map((item) => item.push_token);
          console.log("IIIIIIIIIIIIIIIIIIII",identifiedLocation)
          console.log("HHHHHHHHHHHHHHHHH",push_tokens)
          sendPushNotification(push_tokens); 

           }
//////////////////////////////////////////////////////////     



        }).catch((error) => {
          console.log(error);
        });
        /////////////////////////////////////////////////////////////
      //  // Create a reference to the Firebase Storage bucket
      //  const storageRef = firebase.storage().ref().child('cultivarImage/' + image.split('/').pop());

      //  // Upload the image to Firebase Storage
      //  const responseUrl = await fetch(image);
      //  const blob = await responseUrl.blob();
      //  const snapshot = await storageRef.put(blob);

      //  // Create a reference to the Firestore collection
      //  const collectionRef1 = firebase.firestore().collection('cultivar');

      //  // Add the image metadata to the Firestore collection
      //  collectionRef1.add({
      //    image: await snapshot.ref.getDownloadURL(),
      //    cultivar: cultivar
      //  }).then((docRef) => {
      //    console.log("Document written with ID: ", docRef.id);
      //  }).catch((error) => {
      //    console.error("Error adding document: ", error);
      //  });
    }
  
  };


  if (hasGalleryPermission === false) {
    return <Text>No access to Internal Storage</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {isShow ? (
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              type={type}
              ref={cameraRef}
              flashMode={flash}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 30,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setType(
                      type === CameraType.back
                        ? CameraType.front
                        : CameraType.back
                    );
                  }}
                >
                  <MaterialIcons name="360" size={30} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setFlash(
                      flash === Camera.Constants.FlashMode.off
                        ? Camera.Constants.FlashMode.on
                        : Camera.Constants.FlashMode.off
                    )
                  }
                >
                  <MaterialIcons
                    name="flash-on"
                    color={
                      flash === Camera.Constants.FlashMode.off ? "gray" : "#fff"
                    }
                    size={30}
                  />
                </TouchableOpacity>
              </View>
            </Camera>

            <View style={styles.controls}>
              {image ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 50,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setImage(null)}
                    style={{ flexDirection: "row" }}
                  >
                    <MaterialIcons
                      name="repeat"
                      onPress={() => setImage(null)}
                      size={20}
                      color={"white"}
                    />
                    <Text style={{ color: "white" }}>Re-Take</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={takePicture}
                  icon="camera"
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <MaterialIcons name="camera" size={20} color={"white"} />
                  <Text style={{ color: "white" }}>Take a picture</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <ImageViewer
            placeholderImageSource={PlaceholderImage}
            selectedImage={image}
          />
        )}
      </View>
      <View style={styles.btnContainer}>
        <TouchableOpacity onPress={() => setIsShow(true)} style={styles.btn}>
          <Text style={styles.btnTxt}>Take a Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickImage()} style={styles.btn}>
          <Text style={styles.btnTxt}>Upload a Photo</Text>
        </TouchableOpacity>
      </View>
      {image ? (
        <View style={styles.infoContainer}>
          <View style={styles.txtContainer}>
            {image && <Text style={styles.textIdentification}>Blister : </Text>}

            {image && (
              <Text style={styles.textIdentification1}>{blister}</Text>
            )}
          </View>

          <View style={styles.txtContainer}>
            {image && <Text style={styles.textIdentification}>Cultivar: </Text>}

            {image && (
              <Text style={styles.textIdentification1}>{cultivar}</Text>
            )}
          </View>
        </View>
      ) : null}

      <View style={styles.bottomBtnCon}>
        {image && (
          <View
            style={{
              width: "47%",
              height: "100%",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Severity Symptom Identification")
              }
              style={styles.btn1}
            >
              <Text style={styles.btnTxt1}>
                Severity Symptom Identification
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {image && (
          <View
            style={{
              width: "47%",
              height: "100%",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("Dispersion Pattern")}
              style={styles.btn1}
            >
              <Text style={styles.btnTxt1}>Blister Dispersion</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {isLoading ? <AppLoader /> : null}
    </View>

    // <View style={{ paddingHorizontal: SIZES.padding, paddingVertical: SIZES.padding, backgroundColor: COLORS.white }}>
    //     <View  style={styles.headerText}>
    //     <Text style={styles.header} >Blister Identification View</Text>
    //     </View>
    //     <View>

    //     <View style={{ alignItems: 'center', marginTop: 15 }}>
    //     {image && <Image source={{ uri: image }} style={{ width: 300, height: 300, marginTop:50, }} />}
    // </View>

    // <Image source={image} />

    /* <View style={{  justifyContent: 'space-between', paddingHorizontal: 60 ,marginTop: 50 }}>
            <Button title='Take a Picture' onPress={() => pickImage()} style={{ width: '40%', marginBottom: 20 }} />
            <View style={{ height: 20 }} />
            <Button title='Upload a Picture' onPress={() => pickImage()} style={{ width: '40%' }} />
        </View>

      
            </View>
            

            <Button onPress={() => navigation.navigate('Severity Symptom Identification')} title='Severity Symptom Identification'></Button>
            <Button onPress={() => navigation.navigate('Dispersion Pattern')} title='Blister Dispersion'></Button>
            <Button onPress={() => navigation.navigate('Cultivar')} title='Blister Identification' style={{ width: '40%', marginBottom: 20 }} ></Button>
        </View> */
  );
};

function sendPushNotification(pushToken) {
  console.log("SEND")
  let response = fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: pushToken,
      sound: 'default',
      title: 'Blister Risk Alert',
      body: 'You are in a blister identified risk area. Please take necessary precautions.'
    })
  });
}


const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    color: COLORS.primary,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width / 23,
    paddingTop: height / 60,
  },
  imageContainer: {
    paddingTop: 20,
    marginBottom: -15,
    width: "100%",
    height: "44%",
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  btnContainer: {
    width: "100%",
    height: "20%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignSelf: "center",
    marginBottom: "-3%",
  },
  txtContainer: {
    flexDirection: "row",
    width: "100%",
    paddingLeft: "6%",
  },

  btn: {
    alignSelf: "center",
    borderColor: "#085E22",
    borderWidth: 1,
    borderRadius: 9,
  },
  btnTxt: { padding: "3%", fontWeight: "bold", color: "#085E22", fontSize: 19 },
  btn1: {
    alignSelf: "center",
    borderColor: "#085E22",
    borderWidth: 1,
    borderRadius: 9,
    marginBottom: "1%",
    marginTop: "2%",
    height: "100%",
    justifyContent: "center",
  },
  btnTxt1: {
    paddingHorizontal: "5%",
    fontWeight: "bold",
    color: "#085E22",
    fontSize: 15,
    textAlign: "center",
  },
  textIdentification: {
    fontSize: 20,
    color: "white",
    textAlign: "left",
  },
  textIdentification1: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  infoContainer: {
    width: "70%",
    height: "12%",
    backgroundColor: "#ad2402",
    paddingVertical: "2%",
    borderRadius: 10,
    elevation: 20,
  },
  bottomBtnCon: {
    flexDirection: "row",
    width: "100%",
    marginTop: "8%",
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 8,
    width: "100%",
    height: "100%",
  },
  camera: {
    flex: 5,
    borderRadius: 20,
  },
  topControls: {
    flex: 1,
  },
  controls: {
    flex: 0.7,
  },
  button: {
    height: "8%",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
export default Blister_Identification;
