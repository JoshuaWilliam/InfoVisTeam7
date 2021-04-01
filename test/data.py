import numpy as np
import pandas as pd
import json
import scipy
from sklearn.datasets.samples_generator import make_blobs
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA


def read_scatter():
    with open("test/data/scatterplot.csv") as f:
        df = pd.read_csv(f, index_col=0)
    # return df.to_json()
    return df.to_csv(index=False)


def read_chord_data():
    with open('test/data/test25.json') as f:
        data = json.load(f)
    return data


def read_bar_data():
    with open("test/data/averages.csv") as f:
        print(f)
        df = pd.read_csv(f)
    # return df.to_json()
    return df.to_csv()


def read_cluster_data(feature_number):
    print("Feature number: ", feature_number)
    if feature_number is None:
        with open("test/data/Artitra.csv") as f:
            print(f)
            df = pd.read_csv(f)
        # return df.to_json()
        return df.to_csv()

    else:
        feature_number = int(feature_number)
        with open("test/data/means_12cols.csv") as f:
            print(f)
            f = pd.read_csv(f)
        f_arr = f.to_numpy()
        f_new = np.zeros((f_arr.shape[0], f_arr.shape[1] - 11))
        for i in range(2):
            mini = np.min(f_arr[:, i + feature_number])
            maxi = np.max(f_arr[:, i + feature_number])
            f_new[:, i] = (f_arr[:, i + feature_number] - mini) / (maxi - mini)
        df = pd.DataFrame(f_new, columns=['Feat_1', 'Feat_2'])
        clustering_kmeans = KMeans(
            n_clusters=5, precompute_distances="auto", n_jobs=-1, algorithm='elkan')
        df['clusters'] = clustering_kmeans.fit_predict(df)
        df["clusters"] += 1
        results = pd.DataFrame(f_new, columns=['Feat_1', 'Feat_2'])
        final_df = pd.merge(f["SOURCE_SUBREDDIT"], df,
                            left_index=True, right_index=True)

        # return df.to_json()
        return final_df.to_csv(index=False)
