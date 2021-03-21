import pandas as pd
import json


def read_scatter():
    df = pd.read_csv("test/data/scatterplot.csv")
    return df.to_json()


def read_chord_data():
    with open('test/data/test25.json') as f:
        data = json.load(f)
    return data
