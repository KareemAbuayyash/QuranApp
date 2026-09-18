import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import qiblaStyles from '../styles/QiblaScreenStyles';

const KAABA = { latitude: 21.422487, longitude: 39.826206 };
const HEADING_SAMPLE_COUNT = 6;
const ALIGNED_THRESHOLD = 4;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateQiblaBearing(latitude, longitude) {
  const longitudeDelta = toRadians(KAABA.longitude - longitude);
  const originLatitude = toRadians(latitude);
  const destinationLatitude = toRadians(KAABA.latitude);
  const bearing = Math.atan2(
    Math.sin(longitudeDelta) * Math.cos(destinationLatitude),
    Math.cos(originLatitude) * Math.sin(destinationLatitude) -
      Math.sin(originLatitude) * Math.cos(destinationLatitude) * Math.cos(longitudeDelta)
  );

  return ((bearing * 180) / Math.PI + 360) % 360;
}

function averageAngles(angles) {
  const vector = angles.reduce(
    (result, angle) => ({
      x: result.x + Math.cos(toRadians(angle)),
      y: result.y + Math.sin(toRadians(angle)),
    }),
    { x: 0, y: 0 }
  );

  return (Math.atan2(vector.y, vector.x) * 180 / Math.PI + 360) % 360;
}

function shortestAngle(value) {
  return Math.abs(((value + 180) % 360) - 180);
}

async function fetchQiblaDirection(latitude, longitude) {
  const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
  if (!response.ok) throw new Error('تعذر الاتصال بخدمة تحديد القبلة.');

  const result = await response.json();
  const direction = Number(result?.data?.direction);
  if (!Number.isFinite(direction)) throw new Error('استجابة خدمة القبلة غير صالحة.');

  return (direction + 360) % 360;
}

function getAccuracyLabel(accuracy) {
  if (accuracy === null) return 'جارٍ فحص البوصلة';
  if (accuracy >= 3) return 'البوصلة معايرة بدقة';
  if (accuracy >= 2) return 'دقة البوصلة جيدة';
  return 'البوصلة تحتاج معايرة';
}

export default function QiblaScreen({ navigation }) {
  const headingSamples = useRef([]);
  const [location, setLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [qiblaBearing, setQiblaBearing] = useState(null);
  const [heading, setHeading] = useState(0);
  const [compassAccuracy, setCompassAccuracy] = useState(null);
  const [directionSource, setDirectionSource] = useState('api');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [compassAvailable, setCompassAvailable] = useState(true);

  const loadLocation = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        throw new Error('فعّل خدمة الموقع ثم حاول مرة أخرى.');
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        throw new Error('اسمح للتطبيق بالوصول إلى موقعك لتحديد القبلة بدقة.');
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      const { latitude, longitude, accuracy } = currentLocation.coords;
      setLocation({ latitude, longitude });
      setLocationAccuracy(accuracy);

      try {
        setQiblaBearing(await fetchQiblaDirection(latitude, longitude));
        setDirectionSource('api');
      } catch {
        setQiblaBearing(calculateQiblaBearing(latitude, longitude));
        setDirectionSource('local');
      }

      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'تعذر تحديد موقعك.');
    }
  }, []);

  useEffect(() => {
    let headingSubscription;

    const startCompass = async () => {
      await loadLocation();
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED) return;

        headingSubscription = await Location.watchHeadingAsync((reading) => {
          const rawHeading = reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;
          setCompassAccuracy(reading.accuracy);

          if (!Number.isFinite(rawHeading) || rawHeading < 0 || reading.accuracy === 0) return;

          const nextSamples = [...headingSamples.current, rawHeading].slice(-HEADING_SAMPLE_COUNT);
          headingSamples.current = nextSamples;
          setHeading(averageAngles(nextSamples));
        });
      } catch {
        setCompassAvailable(false);
      }
    };

    startCompass();
    return () => headingSubscription?.remove();
  }, [loadLocation]);

  const arrowRotation = qiblaBearing === null ? 0 : qiblaBearing - heading;
  const remainingDegrees = shortestAngle(arrowRotation);
  const isAligned = compassAvailable && compassAccuracy >= 2 && remainingDegrees <= ALIGNED_THRESHOLD;
  const needsCalibration = compassAccuracy !== null && compassAccuracy < 2;

  return (
    <SafeAreaView style={qiblaStyles.safeArea}>
      <View style={qiblaStyles.container}>
        <View style={qiblaStyles.header}>
          <TouchableOpacity accessibilityLabel="العودة" onPress={() => navigation.goBack()} style={qiblaStyles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color="#7c5c1e" />
          </TouchableOpacity>
          <View style={qiblaStyles.headerCopy}>
            <Text style={qiblaStyles.eyebrow}>القبلة</Text>
            <Text style={qiblaStyles.title}>اتجاه الصلاة</Text>
          </View>
          <TouchableOpacity accessibilityLabel="تحديث الموقع" onPress={loadLocation} style={qiblaStyles.iconButton}>
            <MaterialIcons name="refresh" size={22} color="#7c5c1e" />
          </TouchableOpacity>
        </View>

        {status === 'loading' && (
          <View style={qiblaStyles.centerContent}>
            <ActivityIndicator size="large" color="#bfa76f" />
            <Text style={qiblaStyles.loadingText}>جارٍ تثبيت موقعك وقراءة البوصلة...</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={qiblaStyles.centerContent}>
            <MaterialIcons name="location-off" size={54} color="#b36b5b" />
            <Text style={qiblaStyles.errorText}>{errorMessage}</Text>
            <TouchableOpacity style={qiblaStyles.primaryButton} onPress={loadLocation}>
              <MaterialIcons name="my-location" size={20} color="#fff9ef" />
              <Text style={qiblaStyles.primaryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'ready' && qiblaBearing !== null && (
          <ScrollView contentContainerStyle={qiblaStyles.content} showsVerticalScrollIndicator={false}>
            <View style={[qiblaStyles.statusBar, isAligned && qiblaStyles.statusBarReady]}>
              <MaterialIcons name={isAligned ? 'verified' : 'explore'} size={20} color={isAligned ? '#3f7c4b' : '#bfa76f'} />
              <Text style={[qiblaStyles.statusText, isAligned && qiblaStyles.statusTextReady]}>
                {isAligned ? 'أنت الآن باتجاه القبلة' : `حرّك الهاتف ${Math.round(remainingDegrees)}° نحو السهم`}
              </Text>
            </View>

            <View style={qiblaStyles.compassStage}>
              <View style={qiblaStyles.compassOuter}>
                <View style={qiblaStyles.compassInner}>
                  <View style={[qiblaStyles.targetMarker, isAligned && qiblaStyles.targetMarkerReady]}>
                    <MaterialIcons name="keyboard-arrow-up" size={34} color={isAligned ? '#3f7c4b' : '#bfa76f'} />
                  </View>
                  <Text style={[qiblaStyles.direction, qiblaStyles.north]}>ش</Text>
                  <Text style={[qiblaStyles.direction, qiblaStyles.east]}>ق</Text>
                  <Text style={[qiblaStyles.direction, qiblaStyles.south]}>ج</Text>
                  <Text style={[qiblaStyles.direction, qiblaStyles.west]}>غ</Text>
                  <View style={[qiblaStyles.qiblaArrow, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>
                    <MaterialIcons name="navigation" size={116} color={isAligned ? '#3f7c4b' : '#bfa76f'} />
                  </View>
                  <View style={qiblaStyles.centerMark}>
                    <MaterialIcons name="mosque" size={24} color="#fff9ef" />
                  </View>
                </View>
              </View>
            </View>

            <Text style={qiblaStyles.bearing}>{Math.round(qiblaBearing)}°</Text>
            <Text style={qiblaStyles.bearingCaption}>زاوية القبلة من الشمال الحقيقي</Text>

            <View style={qiblaStyles.metricsRow}>
              <View style={qiblaStyles.metric}>
                <MaterialIcons name="gps-fixed" size={19} color="#bfa76f" />
                <Text style={qiblaStyles.metricLabel}>دقة الموقع</Text>
                <Text style={qiblaStyles.metricValue}>{locationAccuracy ? `± ${Math.round(locationAccuracy)} م` : 'غير متاحة'}</Text>
              </View>
              <View style={qiblaStyles.metricDivider} />
              <View style={qiblaStyles.metric}>
                <MaterialIcons name="compass-calibration" size={19} color="#bfa76f" />
                <Text style={qiblaStyles.metricLabel}>حالة البوصلة</Text>
                <Text style={qiblaStyles.metricValue}>{getAccuracyLabel(compassAccuracy)}</Text>
              </View>
            </View>

            {needsCalibration && (
              <View style={qiblaStyles.calibrationNotice}>
                <MaterialIcons name="screen-rotation" size={21} color="#bfa76f" />
                <Text style={qiblaStyles.calibrationText}>حرّك الهاتف في الهواء على شكل رقم 8، ثم أبقه مستوياً وبعيداً عن المعادن.</Text>
              </View>
            )}

            {!compassAvailable && (
              <View style={qiblaStyles.calibrationNotice}>
                <MaterialIcons name="info-outline" size={21} color="#bfa76f" />
                <Text style={qiblaStyles.calibrationText}>البوصلة غير متاحة على هذا الجهاز؛ استخدم زاوية القبلة المعروضة.</Text>
              </View>
            )}

            <Text style={qiblaStyles.locationText}>موقعك: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
            <Text style={qiblaStyles.sourceText}>{directionSource === 'api' ? 'تم حساب اتجاه القبلة عبر خدمة AlAdhan' : 'تم استخدام الحساب المحلي كبديل مؤقت'}</Text>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
