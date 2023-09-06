import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import backgroundImage from './/android/app/src/main/assets/background.png';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [userIds, setUserId] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // Seçilen kullanıcıyı tutacak
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [shopUsers, setShopUsers] = useState([]); // Shop içindeki kullanıcıları tutacak
  const [userId, setSelectedUserID] = useState(null);

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = (screenWidth - 40) / 3; // 40 margin (5x2 margin * 4 for 3 spaces between buttons)

  const [previewAmount, setPreviewAmount] = useState(0);

  console.log(userId);
  const handleLogin = () => {
    axios
      .post('https://rhinoplay.pro/api/loginusb', {
        username,
        password,
        serial_number: 'web6565',
      })
      .then(response => {
        if (response.data && response.status === 200) {
          setLoggedIn(true); // Başarılı bir giriş yapınca bu değeri true yapmalısınız
          // Bilgileri AsyncStorage'a kaydedin.
          AsyncStorage.setItem(
            'loginData',
            JSON.stringify({
              username: username,
              password: password,
              serialNumber: 'web6565',
            }),
          );
          setUserId(response.data.user.username); // Kullanıcının ID'sini ayarlayın
          setShopId(response.data.user.shop.name); // Kullanıcının ID'sini ayarlayın

          const shopUsers = response.data.user.shop.users;
          setShopUsers(shopUsers || []); // Shop kullanıcılarını state'e ekleyin

          if (shopUsers && shopUsers.length > 0) {
            // Shop içerisindeki tüm kullanıcıları işliyoruz
            const selectedUser = shopUsers.find(
              user => user.user.id === selectedUserData.user.id,
            );
            if (selectedUser) {
              setAmount(selectedUser.user.balance);
            }
          } else {
            console.log('Shop içerisinde kullanıcı bulunmamaktadır.');
          }
        } else {
          setMessage(response.data.message || 'Bir hata oluştu');
        }
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'An error occurred',
          text2: error.message,
        });
        setMessage(error.message || 'Bir hata oluştu');
      });
  };

  const handleAddBalance = () => {
    axios
      .post('https://rhinoplay.pro/api/addBalanceusb', {
        userId: userId,
        amount: previewAmount,
      })
      .then(response => {
        setMessage(response.data.message);
        handleLogin(); // Veriyi yeniden çekmek için login fonksiyonunu çağır
        // Toastr mesajını göster
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Successfully Completed',
          text2: response.data.message,
        });
        const currentBalances = parseFloat(
          selectedUserData.user.balance + previewAmount,
        );
        setAmount(currentBalances);
      })
      .catch(error => {
        setMessage(error.message);

        // Toastr mesajını göster
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'An error occurred',
          text2: error.message,
        });
      });
  };

  const handleAddBalancebutton = newAmount => {
    axios
      .post('https://rhinoplay.pro/api/addBalanceusb', {
        userId,
        amount: newAmount,
      })
      .then(response => {
        setMessage(response.data.message);
        handleLogin(); // Veriyi yeniden çekmek için login fonksiyonunu çağır

        // Toastr mesajını göster
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Successfully Completed',
          text2: response.data.message,
        });
      })
      .catch(error => {
        setMessage(error.message);

        // Toastr mesajını göster
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'An error occurred',
          text2: error.message,
        });
      });
  };

  const handleRemoveBalance = () => {
    axios
      .post('https://rhinoplay.pro/api/removeBalanceusb', {
        userId: userId,
        amount: previewAmount,
      })
      .then(response => {
        setMessage(response.data.message);
        handleLogin(); // Veriyi yeniden çekmek için login fonksiyonunu çağır

        // Toastr mesajını göster
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Successfully Completed',
          text2: response.data.message,
        });
      })
      .catch(error => {
        setMessage(error.message);

        // Toastr mesajını göster
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'An error occurred',
          text2: error.message,
        });
      });
  };

  const handleResetBalance = () => {
    axios
      .post('https://rhinoplay.pro/api/resetBalanceusb', {userId})
      .then(response => {
        setMessage(response.data.message);
        handleLogin(); // Veriyi yeniden çekmek için login fonksiyonunu çağır

        // Toastr mesajını göster
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Successfully Completed',
          text2: response.data.message,
        });
      })
      .catch(error => {
        setMessage(error.message);

        // Toastr mesajını göster
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'An error occurred',
          text2: error.message,
        });
      });
  };

  const handleAddValueToPreviewAmount = value => {
    setPreviewAmount(prevAmount => prevAmount + value);
  };

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setSerialNumber('');
    setLoggedIn(false);
    setMessage('');
    setShopUsers([]);
    AsyncStorage.removeItem('loginData'); // Bilgileri AsyncStorage'dan sil
  };

  const amountButtons = [10, 20, 50, 100, 200, 500];

  useEffect(() => {
    const fetchLoginData = async () => {
      const storedLoginData = await AsyncStorage.getItem('loginData');
      if (storedLoginData) {
        const {username, password, serialNumber} = JSON.parse(storedLoginData);
        setUsername(username);
        setPassword(password);
        setSerialNumber(serialNumber);
      }
    };
    fetchLoginData();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    loggedInContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginContainer: {
      marginTop: 50,
      alignItems: 'center',
    },
    loggedInText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    userIdText: {
      fontSize: 16,
      marginTop: 10,
    },
    selectUserText: {
      fontSize: 16,
      marginTop: 20,
    },
    selectedUserText: {
      fontSize: 16,
      marginTop: 10,
    },
    balanceText: {
      fontSize: 14,
      marginTop: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#2295f1',
      backgroundColor: '#ffffff',
      padding: 10,
      borderRadius: 10,
      width: '100%',
      color: 'black',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      marginRight: 10,
    },
    messageText: {
      color: 'red',
      marginTop: 10,
    },
    userButton: {
      padding: 10,
      margin: 5,
      borderRadius: 10,
      backgroundColor: 'rgb(255,106,0)',
      justifyContent: 'center', // içerikleri dikey olarak ortalar
      alignItems: 'center', // içerikleri yatay olarak ortalar
      borderWidth: 3,
      borderColor: 'rgb(218,218,218)',
    },
    selectedUserDetails: {
      marginTop: 20,
      padding: 5,
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 10,
    },
    loginButton: {
      marginTop: 20,
      backgroundColor: '#3498db',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
      width: '100%', // Bu, butonun tüm genişliği kaplamasını sağlar.
    },
    button: {
      padding: 10,
      backgroundColor: '#3498db',
      borderRadius: 10,
      alignItems: 'center',
      margin: 5,
      justifyContent: 'center', // Dikeyde ortala
      width: 100, // Örnek genişlik
      height: 50, // Örnek yükseklik
    },
    userButtonText: {
      color: 'rgb(255,255,255)', // yazı rengi
      fontWeight: 'bold', // yazı kalınlığı
      fontSize: 20,
    },
    selectedUserButton: {
      backgroundColor: 'rgb(229,12,12)', // örnek olarak mavi renk belirtildi, istediğiniz rengi seçebilirsiniz
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    background: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
    },
  });

  const styles2 = StyleSheet.create({
    rowContainer: {
      padding: 1,
      flexDirection: 'row',
      alignItems: 'center', // İçeriklerin ortalanması için
      justifyContent: 'space-between', // İçerikler arasında eşit boşluk bırakır
    },
    selectedUserText: {
      flex: 1, // 3'te 2'sini kaplar (Eğer genişlik ayarı yapmazsanız bu gerekmeyebilir)
      // Diğer stilleri buraya ekleyin
    },
    input: {
      flex: 1,
      borderWidth: 10,
      borderColor: 'rgb(229,12,12)',
      padding: 3,
      borderRadius: 20,
      width: '100%',
      color: 'black', // 'back' yanlış yazılmış, doğrusu 'black' olmalı.
      fontWeight: 'bold',
      backgroundColor: 'rgb(218,218,218)',
      textAlign: 'center', // Yatayda ortalar.
      textAlignVertical: 'center', // Dikeyde ortalar.
      fontSize: 50,
      marginTop: 20,
    },
  });

  const styles9 = StyleSheet.create({
    rowContainer: {
      padding: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedUserText: {
      flex: 1,
    },
    input: {
      flex: 1,
      borderWidth: 10,
      borderColor: 'rgb(0,147,245)',
      padding: 3,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 20,
      width: '100%',
      color: 'black',
      fontWeight: 'bold',
      backgroundColor: 'rgb(218,218,218)',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 50,
      marginTop: 20,
      height: 80, // Yükseklik değeri ekledim
    },
    clearButton: {
      marginTop: 20,
      // marginLeft: 10,
      padding: 10,
      borderWidth: 10,
      backgroundColor: 'rgb(218,218,218)',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 0,
      borderColor: 'rgb(0,147,245)',
      justifyContent: 'center', // İçerikleri dikeyde ortalar
      alignItems: 'center', // İçerikleri yatayda ortalar
      height: 80, // Yükseklik değeri ekledim
      width: 80, // Genişlik değeri ekledim (isteğe bağlı)
    },
    clearButtonText: {
      fontSize: 16,
      color: 'black',
      fontWeight: 'bold',
    },
  });

  const styles3 = StyleSheet.create({
    rowContainer: {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', // İçerikler arasında eşit boşluk bırakır
    },
    userIdText: {
      flex: 1,
      padding: 5,
      margin: 5,
      borderWidth: 3,
      borderColor: 'rgb(255,255,255)',
      borderRadius: 10,
      backgroundColor: 'rgb(34,149,241)',
      color: 'rgb(255,255,255)',
      fontWeight: 'bold',
      textAlign: 'center', // Yatayda ortalar.
      textAlignVertical: 'center', // Dikeyde ortalar.
      fontSize: 18,
    },
    shopIdText: {
      flex: 1,
      padding: 5,
      margin: 5,
      borderWidth: 3,
      borderColor: 'rgb(255,255,255)',
      borderRadius: 10,
      backgroundColor: 'rgb(34,149,241)',
      color: 'rgb(255,255,255)',
      fontWeight: 'bold',
      textAlign: 'center', // Yatayda ortalar.
      textAlignVertical: 'center', // Dikeyde ortalar.
      fontSize: 18,
    },
  });

  const styles4 = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
      marginTop: 10,
    },
    amountButton: {
      width: buttonWidth,
      padding: 10,
      backgroundColor: 'rgb(229,12,12)',
      borderWidth: 3,
      borderColor: 'rgb(35,34,34)',
      margin: 5,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amountButtonText: {
      color: 'rgb(255,255,255)', // yazı rengi
      fontWeight: 'bold', // yazı kalınlığı
      fontSize: 30,
    },
  });

  const styles5 = StyleSheet.create({
    buttonContainer: {
      marginVertical: 10,
      marginTop: 10,
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
      marginTop: 20,
    },
    addButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgb(17,204,89)',
      padding: 10,
      borderRadius: 5,
      width: '48%',
      borderWidth: 3,
      borderColor: 'rgb(218,218,218)',
    },
    removeButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgb(229,12,12)',
      padding: 10,
      borderRadius: 5,
      width: '48%',
      borderWidth: 3,
      borderColor: 'rgb(218,218,218)',
    },
    resetButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgb(0,140,255)',
      padding: 10,
      borderRadius: 5,
      width: '48%',
      borderWidth: 3,
      borderColor: 'rgb(218,218,218)',
    },
    logoutButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgb(0,140,255)',
      padding: 10,
      borderRadius: 5,
      width: '48%',
      borderWidth: 3,
      borderColor: 'rgb(218,218,218)',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 20,
    },
  });

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        {loggedIn ? (
          <View style={styles.loggedInContainer}>
            <View style={styles3.rowContainer}>
              <Text style={styles3.userIdText}>User: {userIds}</Text>
              <Text style={styles3.shopIdText}>Shop: {shopId}</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              {shopUsers.length > 0 &&
                shopUsers
                  .filter(shopUser => shopUser.user.role_id === 1)
                  .map(shopUser => (
                    <TouchableOpacity
                      key={shopUser.user.id}
                      style={[
                        styles.userButton,
                        selectedUserData &&
                        selectedUserData.user.id === shopUser.user.id
                          ? styles.selectedUserButton
                          : null,
                      ]}
                      onPress={() => {
                        setAmount(shopUser.user.balance);
                        setSelectedUser(shopUser.user.username);
                        setSelectedUserID(shopUser.user.id);
                        setSelectedUserData(shopUser);
                      }}>
                      <Text style={styles.userButtonText}>
                        {shopUser.user.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
            </View>
            {selectedUserData && (
              <View style={styles2.rowContainer}>
                <TextInput
                  style={styles2.input}
                  placeholder="Amount"
                  onChangeText={text => {
                    // Bu kısım artık gereksiz, çünkü bu TextInput artık düzenlenemez.
                  }}
                  value={String(Math.round(amount))}
                  keyboardType="numeric"
                  editable={false} // Bu özellik, TextInput'ın sadece okunabilir (read-only) olmasını sağlar.
                />
              </View>
            )}

            {selectedUserData && (
              <View style={styles9.rowContainer}>
                <TextInput
                  style={styles9.input}
                  placeholder="Amount"
                  value={String(previewAmount)} // a separate state for preview
                  keyboardType="numeric"
                  editable={false}
                />
                <TouchableOpacity
                  style={styles9.clearButton}
                  onPress={() => setPreviewAmount(0)}>
                  <Text style={styles9.clearButtonText}>CLR</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedUserData && (
              <View style={styles4.buttonContainer}>
                {amountButtons.slice(0, 3).map(value => (
                  <TouchableOpacity
                    key={value}
                    style={styles4.amountButton}
                    onPress={() => {
                      handleAddValueToPreviewAmount(value);
                    }}>
                    <Text style={styles4.amountButtonText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedUserData && (
              <View style={styles4.buttonContainer}>
                {amountButtons.slice(3, 6).map(value => (
                  <TouchableOpacity
                    key={value}
                    style={styles4.amountButton}
                    onPress={() => {
                      handleAddValueToPreviewAmount(value);
                    }}>
                    <Text style={styles4.amountButtonText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedUserData && (
              <View style={styles5.buttonContainer}>
                <View style={styles5.rowContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      handleAddBalance(); // Eğer bu fonksiyon API çağrısı yapıyorsa
                      setPreviewAmount(0);
                    }}
                    style={styles5.addButton}>
                    <Text style={styles5.buttonText}>İn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleRemoveBalance(); // Eğer bu fonksiyon API çağrısı yapıyorsa
                      setPreviewAmount(0);
                    }}
                    style={styles5.removeButton}>
                    <Text style={styles5.buttonText}>Out</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles5.rowContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      handleResetBalance(); // Eğer bu fonksiyon API çağrısı yapıyorsa
                      setPreviewAmount(0);
                    }}
                    style={styles5.resetButton}>
                    <Text style={styles5.buttonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles5.logoutButton}>
                    <Text style={styles5.buttonText}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.loginContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              onChangeText={text => setUsername(text)}
              value={username}
            />
            <TextInput
              style={[styles.input, {marginTop: 10}]}
              placeholder="Password"
              onChangeText={text => setPassword(text)}
              value={password}
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Toast
        ref={refs => {
          return Toast.setRef(refs);
        }}
      />
    </ImageBackground>
  );
};

export default App;
