# Create your own Machine Learning Model


## Setup
To create a custom image classification model, we need to use a graphics processing unit (GPU) enabled training job instance. GPUs are excellent at parallelizing the computations required to train a neural network for this project. In order to access a GPU-enabled training job instance, you must submit a request for a service limit increase to the [AWS Support Center](https://console.aws.amazon.com/support/home?#/case/create). You can follow the instructions [here]() to increase your limit. For this recipe we will use a single *ml.p2.xlarge* instance. 

### Request a GPU-enabled Amazon SageMaker Training Instance

1. Open the [AWS Support Center console](https://console.aws.amazon.com/support/home#/case/create).

1. On the **AWS Support Center** page, choose **Create Case** and then choose Service limit increase.

1. In the **Case classification** panel under **Limit type**, search for Amazon SageMaker.

1. In the **Request** panel, choose the **Region** that you are working in. For **Resource Type**, choose **SageMaker Training**.

1. For **Limit** choose **ml.p2.xlarge instances**.

1. For **New Limit Value**, verify that the value is **1**.

1. In **Case description**, provide a brief explanation of why you need the **Service limit increase**. For example, I need to use this GPU-enabled training job instance to train a deep learning model using TensorFlow. I'll use this model on an AWS DeepLens device.

1. In **Contact options**, provide some details about how you would like to be contacted by the AWS service support team on the status of your **Service limit increase** request.

1. Choose **Submit**.


## Prepare Training Data

This walkthrough uses an ML algorithm called an ***image classification model***. These models learn to distinguish between different objects by observing many examples over many iterations. This post uses a technique called transfer learning to dramatically reduce the time and data required to train an image classification model. For more information about transfer learning with Amazon SageMaker built-in algorithms, see [How Image Classification Works](https://docs.aws.amazon.com/sagemaker/latest/dg/IC-HowItWorks.html). With transfer learning, you only need a few hundred images of each type of trash. As you add more training samples and vary the viewing angle and lighting for each type of trash, the model takes longer to train but improves its accuracy during inference, when you ask the model to classify trash items it has never seen before.

Before going out and collecting images yourself, consider using the many sources for images that are publicly available. Wewant images that have clear labels (often done by humans) on what’s inside the image. Here are some sources you could look for your use case:

* [AWS Open Data](https://aws.amazon.com/opendata) – Contains a variety of datasets sourced from trusted entities that share and open their datasets for general use. 
* [AWS Data Exchange](https://aws.amazon.com/data-exchange/) – Contains datasets that are both free and available for a fee or subscription charge. These are very well curated and labeled and therefore involve a charge in most cases. 
* [GitHub](https://github.com/) – Offers several public repos with image datasets. Make sure you comply with the terms and conditions and reference the original owners when your work is published.
* [Kaggle](https://www.kaggle.com/datasets) – Has a wide variety of public datasets. Also, they provide some interesting starter Jupyter notebooks. 
* Non-profit and [government organizations](https://data.gov/) – Often publish data for public use under certain terms. These can be a great source of data.
* [Amazon SageMaker Ground Truth](https://aws.amazon.com/sagemaker/groundtruth/) – Creates labeled datasets from your images. You can choose between automated labeling (recommended for common objects) or use human labelers or [AWS Marketplace](https://aws.amazon.com/marketplace) offerings for more specific labeling use cases. For more information, see [Build Highly Accurate Training Datasets with Amazon SageMaker Ground Truth](https://aws.amazon.com/getting-started/tutorials/build-training-datasets-amazon-sagemaker-ground-truth/).

A good practice for collecting images is to use pictures at different possible angles and lighting conditions to make the model more robust. The following image is an example of the type of image the model classifies into landfill, recycling, or compost.

![Image Example](/images/400_advanced/410_build_a_custom_ml/412_collect_training_data/datasetexample.jpg)

When you have your images for each type of trash, separate the images into folders. 

```
|-images

        |-Compost

        |-Landfill

        |-Recycle
```
After you have the images you want to train your ML model on, upload them to [Amazon S3](http://aws.amazon.com/s3). First, [create an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html).


This recipe provides a dataset of images labeled under the categories of recycling, landfill, and compost. 


## Train your model

This recipe uses Amazon SageMaker Jupyter notebooks as the development environment to train your models. Jupyter Notebook is an open-source web application that allows you to create and share documents that contain live code, equations, visualizations, and narrative text. A full Jupyter notebook has been prepared for you to follow along.

First, download the example notebook: [aws-deeplens-custom-trash-detector.ipynb](/code/trash-sorter/aws-deeplens-custom-trash-detector.ipynb) 

Then to create a custom image classification model, you need to use a graphics processing unit (GPU) enabled training job instance. GPUs are excellent at parallelizing the computations required to train a neural network. This tutorial uses a single ml.p2.xlarge instance. In order to access a GPU-enabled training job instance, you must submit a request for a service limit increase to the AWS Support Center. You can follow the [instructions here](/400_advanced/410_trash_sorter/411_setup/) to increase your limit. 

After you have received your limit increase, [Launch your Amazon SageMaker notebook instance](https://docs.aws.amazon.com/sagemaker/latest/dg/gs-setup-working-env.html). 

* Use a t2.medium instance type, which is included in the Amazon SageMaker free tier. For more information, see [Amazon SageMaker Pricing](https://aws.amazon.com/sagemaker/pricing/).
* When you create a role, reference the S3 bucket the project uses (prefix **deeplens-**).

Enter a name for your notebook instance, leave everything else the default except for the volume size. Enter volume size of *50 GB* or more because we'll first download the data to our notebook instance before uploading the data to Amazon S3.

![lab4-sagemaker-create-notebook-1](/images/400_train_a_custom_model/lab4-sagemaker-create-notebook-1.png)

![lab4-sagemaker-create-notebook-2](/images/400_train_a_custom_model/lab4-sagemaker-create-notebook-2.png)

If you use Amazon SageMaker for the first time, please create an IAM role by choosing "Create a new role" from the selection list.

![l400-lab0-4](/images/400_train_a_custom_model/lab4-sagemaker-create-notebook-6.png)

On the pop-up menu, select **Any S3 bucket** to allow the notebook instance to any S3 buckets in your account. Then, click on "Create role" button on the bottom.

Your notebook instance will take a minute to be configured. Once you see the status change to **InService** on the **Notebook instances** page, choose **Open Jupyter** to launch your newly created Jupyter notebook instance.

You should see the page below

![](/images/400_advanced/410_build_a_custom_ml/414_training_a_model/notebookupload.jpg)

Now upload the [aws-deeplens-custom-trash-detector.ipynb](/code/trash-sorter/aws-deeplens-custom-trash-detector.ipynb) file you downloaded earlier.

Once the notebook has uploaded, click on its name to open it.

If you’re new to Jupyter notebooks, you will notice that it contains mixture of text and code cells. To run a piece of code, select the cell and then press shift + enter. While the cell is running an *asterisk* will appear next to the cell. Once complete, an output number and new output cell will appear below the original cell.

Click on the **Run** button in the top toolbar to execute the code/text in that section. Continue clicking the run button for subsequent cells until you get to the bottom of the notebook. Alternatively, you can also use the keyboard shortcuts **Shift + Enter**.

As each section runs, it will spit out log output of what it's doing. Sometimes you'll see a **[ * ]** on the left hand side. This means that the code is still running. Once the code is done running, you'll see a number. This number represents the order in which the code was executed.

After you follow the notebook through to the end, you have a trained model to distinguish between different types of trash.