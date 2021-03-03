from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash
import pandas as pd

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('home.html')

if __name__ == '__main__':
    app.run()
