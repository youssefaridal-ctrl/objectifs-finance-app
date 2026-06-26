import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFirebaseConfigured } from '../firebase/config';
import { watchAuth, watchRemoteData, pushRemoteData } from '../firebase/sync';

export type SalaireRow = { id: string; categorie: string; pourcentage: number; prevu: number; reel: number };
export type SalaireMonth = { id: string; mois: string; salaireNet: number; categories: SalaireRow[] };
export type CreditRow = { id: string; nom: string; montant: number; taux: number; duree: number; moisPayes: number };
export type EpargneRow = { id: string; mois: string; prevu: number; reel: number };
export type ObjectifRow = { id: string; rubrique: string; objectifGlobal: string; periode: string; action: string; fait: boolean };

type DataState = {
  salaireMois: SalaireMonth[];
  credits: CreditRow[];
  epargne: EpargneRow[];
  objectifs: ObjectifRow[];
};

const MOIS_ORDRE = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function moisSuivant(mois: string): string {
  const idx = MOIS_ORDRE.findIndex((m) => m.toLowerCase() === mois.trim().toLowerCase());
  if (idx === -1) return 'Mois suivant';
  return MOIS_ORDRE[(idx + 1) % MOIS_ORDRE.length];
}

const defaultData: DataState = {
  salaireMois: [
    {
      id: '1',
      mois: 'Mai',
      salaireNet: 10000,
      categories: [
        { id: '1', categorie: 'Logement', pourcentage: 30, prevu: 3000, reel: 1825 },
        { id: '2', categorie: 'Alimentation', pourcentage: 15, prevu: 1500, reel: 1500 },
        { id: '3', categorie: 'Transport', pourcentage: 10, prevu: 1000, reel: 700 },
        { id: '4', categorie: 'Crédits / dettes', pourcentage: 10, prevu: 1000, reel: 1000 },
        { id: '5', categorie: 'Épargne', pourcentage: 10, prevu: 1000, reel: 1000 },
        { id: '6', categorie: 'Paradis', pourcentage: 5, prevu: 500, reel: 500 },
        { id: '7', categorie: 'Loisirs / divers', pourcentage: 10, prevu: 1000, reel: 400 },
        { id: '8', categorie: 'Santé / assurance', pourcentage: 5, prevu: 500, reel: 0 },
        { id: '9', categorie: 'Imprévus', pourcentage: 5, prevu: 500, reel: 0 },
      ],
    },
  ],
  credits: [
    { id: '1', nom: 'MOUAD IMPOT', montant: 5000, taux: 5, duree: 7, moisPayes: 0 },
    { id: '2', nom: 'LAILA ARIDAL', montant: 1500, taux: 5, duree: 7, moisPayes: 0 },
    { id: '3', nom: 'SANAA ARIDAL', montant: 1800, taux: 5, duree: 7, moisPayes: 0 },
    { id: '4', nom: 'ZBAIDI ABDELHADI', montant: 1000, taux: 5, duree: 7, moisPayes: 0 },
    { id: '5', nom: 'BOUSSAGUI MOHAMMED', montant: 1000, taux: 5, duree: 7, moisPayes: 0 },
    { id: '6', nom: 'KHALI MOSTAFA', montant: 2100, taux: 5, duree: 12, moisPayes: 0 },
    { id: '7', nom: 'EL MAATI', montant: 2000, taux: 5, duree: 12, moisPayes: 0 },
    { id: '8', nom: 'ZBAIDI ABDELHADI', montant: 3250, taux: 5, duree: 12, moisPayes: 0 },
    { id: '9', nom: 'ZAKARIA CANADA', montant: 5000, taux: 5, duree: 12, moisPayes: 0 },
    { id: '10', nom: 'HAYAT ARIDAL', montant: 9000, taux: 5, duree: 12, moisPayes: 0 },
    { id: '11', nom: 'STE VIE', montant: 7350, taux: 5, duree: 12, moisPayes: 0 },
  ],
  epargne: [
    { id: '1', mois: 'Janvier', prevu: 1000, reel: 1000 },
    { id: '2', mois: 'Février', prevu: 1000, reel: 1000 },
    { id: '3', mois: 'Mars', prevu: 1000, reel: 1000 },
    { id: '4', mois: 'Avril', prevu: 1000, reel: 1000 },
    { id: '5', mois: 'Mai', prevu: 1000, reel: 1000 },
    { id: '6', mois: 'Juin', prevu: 0, reel: 0 },
    { id: '7', mois: 'Juillet', prevu: 0, reel: 0 },
    { id: '8', mois: 'Août', prevu: 0, reel: 0 },
    { id: '9', mois: 'Septembre', prevu: 0, reel: 0 },
    { id: '10', mois: 'Octobre', prevu: 0, reel: 0 },
    { id: '11', mois: 'Novembre', prevu: 0, reel: 0 },
    { id: '12', mois: 'Décembre', prevu: 0, reel: 0 },
  ],
  objectifs: [
    { id: '1', rubrique: 'Finance', objectifGlobal: 'Éliminer complètement la dette et frais Omra', periode: '2e semestre 2026', action: 'Payer 10 300 DH crédit', fait: false },
    { id: '2', rubrique: 'Finance', objectifGlobal: 'Éliminer complètement la dette et frais Omra', periode: '1er semestre 2027', action: 'Payer 14 700 DH crédit + 6 000 DH Omra', fait: false },
    { id: '3', rubrique: 'Finance', objectifGlobal: 'Éliminer complètement la dette et frais Omra', periode: '2e semestre 2027', action: 'Payer 14 700 DH crédit + 10 000 DH Omra', fait: false },
    { id: '4', rubrique: 'Finance', objectifGlobal: 'Éliminer complètement la dette et frais Omra', periode: 'Année 2028', action: 'Voiture + 30 000 DH de réserve', fait: false },

    { id: '5', rubrique: 'Finance', objectifGlobal: 'Source de revenus secondaire', periode: '2e semestre 2026', action: 'Blogging + cuisines + nouveau challenge', fait: false },
    { id: '6', rubrique: 'Finance', objectifGlobal: 'Source de revenus secondaire', periode: 'Année 2027', action: 'Blogging + cuisines', fait: false },
    { id: '7', rubrique: 'Finance', objectifGlobal: 'Source de revenus secondaire', periode: 'Année 2028', action: 'Créer ma propre entreprise', fait: false },

    { id: '8', rubrique: 'Santé', objectifGlobal: 'Perte de poids', periode: '2e semestre 2026', action: 'Nutrition healthy - natation', fait: false },
    { id: '9', rubrique: 'Santé', objectifGlobal: 'Perte de poids', periode: 'Année 2027', action: 'Salle de sport - natation - cyclisme', fait: false },
    { id: '10', rubrique: 'Santé', objectifGlobal: 'Perte de poids', periode: 'Année 2028', action: 'Habitude sport et nutrition', fait: false },

    { id: '11', rubrique: 'Famille', objectifGlobal: 'Passer plus de temps & de qualité en famille', periode: '2e semestre 2026', action: 'Voyages - sortie - déconnecter après 19h et le weekend', fait: false },
    { id: '12', rubrique: 'Famille', objectifGlobal: 'Passer plus de temps & de qualité en famille', periode: 'Année 2027', action: 'Voyages - lecture - natation ensemble', fait: false },
    { id: '13', rubrique: 'Famille', objectifGlobal: 'Passer plus de temps & de qualité en famille', periode: 'Année 2028', action: 'Voyages - lecture - natation ensemble', fait: false },

    { id: '14', rubrique: 'Religion', objectifGlobal: 'Accomplir régulièrement les 5 prières quotidiennes à l\'heure et à la mosquée', periode: '2e semestre 2026', action: '5 prières quotidiennes', fait: false },
    { id: '15', rubrique: 'Religion', objectifGlobal: 'Accomplir régulièrement les 5 prières quotidiennes à l\'heure et à la mosquée', periode: 'Année 2027', action: '5 prières quotidiennes à l\'heure et à la mosquée', fait: false },
    { id: '16', rubrique: 'Religion', objectifGlobal: 'Accomplir régulièrement les 5 prières quotidiennes à l\'heure et à la mosquée', periode: 'Année 2028', action: 'Mémoriser le Saint Coran', fait: false },

    { id: '17', rubrique: 'Santé', objectifGlobal: 'Examens médicaux réguliers', periode: '2e semestre 2026', action: 'Continuer traitement les dents', fait: false },
    { id: '18', rubrique: 'Santé', objectifGlobal: 'Examens médicaux réguliers', periode: 'Année 2027', action: 'Effectuer un examen complet', fait: false },
    { id: '19', rubrique: 'Santé', objectifGlobal: 'Examens médicaux réguliers', periode: 'Année 2028', action: 'Effectuer un examen complet - poids 85kg', fait: false },

    { id: '20', rubrique: 'Développement personnel', objectifGlobal: 'Développement', periode: '2e semestre 2026', action: 'Lecture et intelligence artificielle - langue FR/AN', fait: false },
    { id: '21', rubrique: 'Développement personnel', objectifGlobal: 'Développement', periode: 'Année 2027', action: 'Lecture et intelligence artificielle - langue FR/AN', fait: false },
    { id: '22', rubrique: 'Développement personnel', objectifGlobal: 'Développement', periode: 'Année 2028', action: 'Lecture et intelligence artificielle - langue FR/AN', fait: false },
  ],
};

const STORAGE_KEY = 'objectifs-finance-data-v1';

type DataContextType = {
  data: DataState;
  loaded: boolean;
  cloudStatus: 'disabled' | 'connecting' | 'synced';
  upsertRow: <K extends Exclude<keyof DataState, 'salaireMois'>>(table: K, row: DataState[K][number]) => void;
  deleteRow: (table: Exclude<keyof DataState, 'salaireMois'>, id: string) => void;
  upsertSalaireCategorie: (moisId: string, row: SalaireRow) => void;
  deleteSalaireCategorie: (moisId: string, id: string) => void;
  cloturerMoisSalaire: () => void;
  toggleObjectifFait: (id: string) => void;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataState>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'disabled' | 'connecting' | 'synced'>(
    isFirebaseConfigured ? 'connecting' : 'disabled'
  );
  const uidRef = useRef<string | null>(null);
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const objectifsOutdated = !parsed.objectifs?.length || !('periode' in parsed.objectifs[0]);
          const salaireMois = parsed.salaireMois?.length
            ? parsed.salaireMois
            : parsed.salaire
            ? [{ id: '1', mois: 'Mai', salaireNet: 10000, categories: parsed.salaire }]
            : defaultData.salaireMois;
          const objectifs = objectifsOutdated
            ? defaultData.objectifs
            : parsed.objectifs.map((o: any) => ({ fait: false, ...o }));
          const credits = (parsed.credits ?? defaultData.credits).map((c: any) => ({ moisPayes: 0, ...c }));
          setData({
            ...parsed,
            salaireMois,
            credits,
            objectifs,
          });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubAuth = watchAuth((user) => {
      if (!user) return;
      uidRef.current = user.uid;
      const unsubData = watchRemoteData(user.uid, (remote) => {
        applyingRemoteRef.current = true;
        setData(remote as DataState);
        setCloudStatus('synced');
      });
      return unsubData;
    });
    return () => {
      if (typeof unsubAuth === 'function') unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!loaded || !isFirebaseConfigured || !uidRef.current) return;
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    pushRemoteData(uidRef.current, data).catch((e) => console.warn('Sync Firestore échouée', e));
  }, [data, loaded]);

  const upsertRow = useCallback(<K extends keyof DataState>(table: K, row: DataState[K][number]) => {
    setData((prev) => {
      const list = prev[table] as any[];
      const idx = list.findIndex((r) => r.id === row.id);
      const next = idx >= 0 ? list.map((r) => (r.id === row.id ? row : r)) : [...list, row];
      return { ...prev, [table]: next };
    });
  }, []);

  const deleteRow = useCallback((table: Exclude<keyof DataState, 'salaireMois'>, id: string) => {
    setData((prev) => ({ ...prev, [table]: (prev[table] as any[]).filter((r) => r.id !== id) }));
  }, []);

  const toggleObjectifFait = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      objectifs: prev.objectifs.map((o) => (o.id === id ? { ...o, fait: !o.fait } : o)),
    }));
  }, []);

  const upsertSalaireCategorie = useCallback((moisId: string, row: SalaireRow) => {
    setData((prev) => ({
      ...prev,
      salaireMois: prev.salaireMois.map((m) => {
        if (m.id !== moisId) return m;
        const idx = m.categories.findIndex((c) => c.id === row.id);
        const categories =
          idx >= 0 ? m.categories.map((c) => (c.id === row.id ? row : c)) : [...m.categories, row];
        return { ...m, categories };
      }),
    }));
  }, []);

  const deleteSalaireCategorie = useCallback((moisId: string, id: string) => {
    setData((prev) => ({
      ...prev,
      salaireMois: prev.salaireMois.map((m) =>
        m.id !== moisId ? m : { ...m, categories: m.categories.filter((c) => c.id !== id) }
      ),
    }));
  }, []);

  const cloturerMoisSalaire = useCallback(() => {
    setData((prev) => {
      const current = prev.salaireMois[0];
      if (!current) return prev;
      const nouveauMois: SalaireMonth = {
        id: String(Date.now()),
        mois: moisSuivant(current.mois),
        salaireNet: current.salaireNet,
        categories: current.categories.map((c) => ({ ...c, id: `${Date.now()}-${c.id}`, reel: 0 })),
      };
      return { ...prev, salaireMois: [nouveauMois, ...prev.salaireMois] };
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        loaded,
        cloudStatus,
        upsertRow,
        deleteRow,
        upsertSalaireCategorie,
        deleteSalaireCategorie,
        cloturerMoisSalaire,
        toggleObjectifFait,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
