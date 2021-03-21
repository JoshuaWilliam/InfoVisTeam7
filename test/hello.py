from flask import Flask, request, session, g, redirect, url_for, abort, \
    render_template, flash
import pandas as pd
import data

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('home.html')

@app.route('/chord')
def render_chord():
    return render_template('chord.html')

@app.route('/chord_data', methods=['GET'])
def get_chord_data():
    chord_data = data.read_chord_data()
    return chord_data


@app.route('/scatter_data', methods=['GET'])
def get_scatter_data():
    scatter_data = data.read_scatter()
    return scatter_data


if __name__ == '__main__':
    app.run()
