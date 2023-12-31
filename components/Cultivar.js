import { View, Text, Button, Image } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { firebase } from "../global/firebase";
import * as Notifications from "expo-notifications";
import AppLoader from "./AppLoader";
import ip_address from '../global/Config'
const Cultivar = () => {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [image, setImage] = useState(null);

  const [cultivarData, setCultivarData] = useState(null);
  const [cultivar, setCultivar] = useState(null);

  const [blisterData, setBlisterData] = useState(null);
  const [blister, setBlister] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const pickImage = async () => {
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
        .post(ip_address+"/getCultivar", formData, {
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
        })
        .catch((error) => {
          console.log(error);
        });
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
        })
        .catch((error) => {
          console.log(error);
        });

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

    function sendPushNotification(pushToken) {
      console.log("SEND");
      let response = fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: pushToken,
          sound: "default",
          title: "Alert",
          body: "You are in blister identified area.",
        }),
      });
    }

    const push_tokens = [
      "ExponentPushToken[9DEVmGIEsRztlViD5ZXTyT]",
      "ExponentPushToken[3iYa_YCOJyJO7TcPOrWXGS]",
    ]; // ['ExponentPushToken[zm25DyHvYiKbj5-P_tb267]','ExponentPushToken[0Dk-EjCaeBjY5ipmnGYs3-]'];
    sendPushNotification(push_tokens);
  };

  if (hasGalleryPermission === false) {
    return <Text>No access to Internal Storage</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* <Button title='Image Picker' onPress={() => pickImage()} style={{ marginTop: 30 }} /> */}
      <View
        style={{
          justifyContent: "space-between",
          paddingHorizontal: 60,
          marginTop: 50,
        }}
      >
        <Button
          title="Camera"
          onPress={() => pickImage()}
          style={{ width: "40%", marginBottom: 20 }}
        />
        <View style={{ height: 20 }} />
        <Button
          title="Gallery"
          onPress={() => pickImage()}
          style={{ width: "40%" }}
        />
      </View>
      <View style={{ alignItems: "center", marginTop: 15 }}>
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: 300, height: 300, marginTop: 50 }}
          />
        )}
      </View>

      <View style={{ alignItems: "center", marginLeft: 40, marginTop: 30 }}>
        {image && (
          <Text style={{ marginBottom: 20, fontSize: 15, fontWeight: "bold" }}>
            Blister: Blister Identified
          </Text>
        )}
      </View>

      <View style={{ alignItems: "center", marginLeft: 40, marginTop: 10 }}>
        {image && (
          <Text style={{ marginBottom: 20, fontSize: 15, fontWeight: "bold" }}>
            Cultivar: {cultivar}
          </Text>
        )}
      </View>
      {isLoading ? <AppLoader /> : null}
    </View>
  );
};

export default Cultivar;
